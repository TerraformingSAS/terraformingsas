import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

async function boot(dismissed = false, pathname = "/", href = "") {
  const code = await readFile(new URL("../../../public/consent.js", import.meta.url), "utf8");
  const scripts: string[] = [];
  const store = new Map<string, string>();
  if (dismissed) store.set("terraforming.cookie-notice", "1");
  const scriptNode = {
    parentNode: {
      insertBefore(node: { src?: string }) {
        if (node.src) scripts.push(node.src);
      },
    },
  };
  const document = {
    title: "TERRA",
    head: { appendChild(node: { src?: string }) { if (node.src) scripts.push(node.src); } },
    createElement: () => ({ async: false, src: "" }),
    getElementsByTagName: () => [scriptNode],
  };
  const window = {
    document,
    location: {
      pathname,
      search: "",
      hostname: "",
      href: href || "https://www.terraformings.co" + pathname,
      reload() {},
    },
    dispatchEvent() {},
  };
  const localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  };
  const context = { window, document, localStorage, Event };
  runInNewContext(code, context);
  return {
    scripts,
    store,
    window: context.window as {
      dataLayer?: ArrayLike<unknown>[];
      clarity?: { q?: unknown[][] };
      TerraConsent: { noticeDismissed: () => boolean; dismissNotice: () => void; trackPage: () => void };
    },
  };
}

function queued(dataLayer: ArrayLike<unknown>[] | undefined, name: string) {
  return (dataLayer ?? []).filter((entry) => entry[0] === "event" && entry[1] === name);
}

test("mide la visita y las páginas siguientes aunque se cierre el aviso", async () => {
  const visit = await boot();
  assert.equal(visit.window.TerraConsent.noticeDismissed(), false);
  assert.equal(queued(visit.window.dataLayer, "page_view").length, 1);
  assert.ok(visit.scripts.some((src) => src.includes("googletagmanager.com/gtag/js?id=G-T419MSNEWJ")));
  assert.ok(visit.scripts.some((src) => src.includes("clarity.ms/tag/yvum2tlvam")));
  assert.ok(visit.scripts.some((src) => src.includes("fbevents.js")));
  const granted = visit.window.clarity?.q?.some(
    (entry) => entry[0] === "consentv2" && (entry[1] as { analytics_Storage?: string }).analytics_Storage === "granted",
  );
  assert.equal(granted, true);
  visit.window.TerraConsent.dismissNotice();
  assert.equal(visit.window.TerraConsent.noticeDismissed(), true);
  visit.window.location.href = "https://www.terraformings.co/terra";
  visit.window.location.pathname = "/terra";
  visit.window.TerraConsent.trackPage();
  assert.equal(queued(visit.window.dataLayer, "page_view").length, 2);
  visit.window.TerraConsent.trackPage();
  assert.equal(queued(visit.window.dataLayer, "page_view").length, 2);
});

test("el cotizador y sus páginas derivadas no cargan medición externa", async () => {
  const quote = await boot(false, "/terra/cotizador");
  assert.equal(quote.scripts.length, 0);
  assert.equal(queued(quote.window.dataLayer, "page_view").length, 0);
  for (const path of ["/terra/cotizador/login", "/terra/cotizador/estadisticas", "/terra/cotizador/parametros"]) {
    quote.window.location.pathname = path;
    quote.window.location.href = "https://www.terraformings.co" + path;
    quote.window.TerraConsent.trackPage();
    assert.equal(quote.scripts.length, 0);
    assert.equal(queued(quote.window.dataLayer, "page_view").length, 0);
  }
  quote.window.location.pathname = "/terra";
  quote.window.location.href = "https://www.terraformings.co/terra";
  quote.window.TerraConsent.trackPage();
  assert.equal(queued(quote.window.dataLayer, "page_view").length, 1);
  assert.ok(quote.scripts.some((src) => src.includes("clarity.ms/tag/yvum2tlvam")));
  assert.ok(quote.scripts.some((src) => src.includes("fbevents.js")));
});

test("entrar al cotizador detiene la medición que ya estaba activa", async () => {
  const visit = await boot();
  visit.window.location.pathname = "/terra/cotizador";
  visit.window.location.search = "?lote=A-1";
  visit.window.location.href = "https://www.terraformings.co/terra/cotizador?lote=A-1";
  visit.window.TerraConsent.trackPage();
  assert.equal(queued(visit.window.dataLayer, "page_view").length, 1);
  const stopped = visit.window.clarity?.q?.some((entry) => entry[0] === "stop");
  assert.equal(stopped, true);
  visit.window.location.pathname = "/terra/cotizador/parametros";
  visit.window.location.search = "";
  visit.window.location.href = "https://www.terraformings.co/terra/cotizador/parametros";
  visit.window.TerraConsent.trackPage();
  assert.equal(queued(visit.window.dataLayer, "page_view").length, 1);
});

test("una url de vista previa con vercel no carga medición externa", async () => {
  const preview = await boot(false, "/", "https://terraformingsas-git-cursor.vercel.app/");
  assert.equal(preview.scripts.length, 0);
  assert.equal(queued(preview.window.dataLayer, "page_view").length, 0);
  preview.window.location.pathname = "/terra";
  preview.window.location.href = "https://terraformingsas-git-cursor.vercel.app/terra";
  preview.window.TerraConsent.trackPage();
  assert.equal(preview.scripts.length, 0);
  assert.equal(queued(preview.window.dataLayer, "page_view").length, 0);
});
