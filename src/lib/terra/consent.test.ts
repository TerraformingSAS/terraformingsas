import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

async function boot(stored: string | null = null, entry = false) {
  const code = await readFile(new URL("../../../public/consent.js", import.meta.url), "utf8");
  const scripts: string[] = [];
  const store = new Map<string, string>();
  const session = new Map<string, string>();
  if (stored) store.set("terraforming.cookie-consent", stored);
  if (entry) session.set("terraforming.entry-counted", "1");
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
    location: { pathname: "/", search: "", href: "https://www.terraformings.co/", reload() {} },
    dispatchEvent() {},
  };
  const localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  };
  const sessionStorage = {
    getItem: (key: string) => session.get(key) ?? null,
    setItem: (key: string, value: string) => session.set(key, value),
  };
  const context = { window, document, localStorage, sessionStorage, Event };
  runInNewContext(code, context);
  return {
    scripts,
    store,
    window: context.window as {
      dataLayer?: ArrayLike<unknown>[];
      clarity?: { q?: unknown[][] };
      TerraConsent: { read: () => string | null; grant: () => void; deny: () => void; trackPage: () => void };
    },
  };
}

function queued(dataLayer: ArrayLike<unknown>[] | undefined, name: string) {
  return (dataLayer ?? []).filter((entry) => entry[0] === "event" && entry[1] === name);
}

test("sin autorización cuenta solo la primera página de la visita", async () => {
  const pending = await boot();
  assert.equal(pending.window.TerraConsent.read(), null);
  assert.equal(queued(pending.window.dataLayer, "page_view").length, 1);
  assert.ok(pending.scripts.some((src) => src.includes("fbevents.js")));
  const limited = pending.window.clarity?.q?.some(
    (entry) => entry[0] === "consentv2" && (entry[1] as { analytics_Storage?: string }).analytics_Storage === "denied",
  );
  assert.equal(limited, true);
  pending.window.location.href = "https://www.terraformings.co/terra";
  pending.window.location.pathname = "/terra";
  pending.window.TerraConsent.trackPage();
  assert.equal(queued(pending.window.dataLayer, "page_view").length, 1);
  pending.window.TerraConsent.deny();
  pending.window.TerraConsent.trackPage();
  assert.equal(queued(pending.window.dataLayer, "page_view").length, 1);

  const later = await boot("denied", true);
  assert.equal(later.scripts.length, 0);
  assert.equal(later.window.dataLayer, undefined);
});

test("al aceptar sigue midiendo las páginas siguientes", async () => {
  const accepted = await boot();
  accepted.window.location.href = "https://www.terraformings.co/terra";
  accepted.window.location.pathname = "/terra";
  accepted.window.TerraConsent.grant();
  assert.equal(accepted.window.TerraConsent.read(), "granted");
  assert.ok(accepted.scripts.some((src) => src.includes("googletagmanager.com/gtag/js?id=G-T419MSNEWJ")));
  assert.ok(accepted.scripts.some((src) => src.includes("clarity.ms/tag/yvum2tlvam")));
  assert.equal(queued(accepted.window.dataLayer, "page_view").length, 2);
  const granted = accepted.window.clarity?.q?.some(
    (entry) => entry[0] === "consentv2" && (entry[1] as { analytics_Storage?: string }).analytics_Storage === "granted",
  );
  assert.equal(granted, true);
  const again = await boot("granted");
  assert.equal(queued(again.window.dataLayer, "page_view").length, 1);
});
