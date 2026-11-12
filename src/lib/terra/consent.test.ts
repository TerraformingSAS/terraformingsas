import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

async function boot(stored: string | null = null) {
  const code = await readFile(new URL("../../../public/consent.js", import.meta.url), "utf8");
  const scripts: string[] = [];
  const store = new Map<string, string>();
  if (stored) store.set("terraforming.cookie-consent", stored);
  const scriptNode = {
    parentNode: {
      insertBefore(node: { src?: string }) {
        if (node.src) scripts.push(node.src);
      },
    },
  };
  const document = {
    head: { appendChild(node: { src?: string }) { if (node.src) scripts.push(node.src); } },
    createElement: () => ({ async: false, src: "" }),
    getElementsByTagName: () => [scriptNode],
  };
  const window = {
    document,
    location: { pathname: "/", reload() {} },
    dispatchEvent() {},
  };
  const localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  };
  const context = { window, document, localStorage, Event };
  runInNewContext(code, context);
  return { scripts, store, consent: (context.window as { TerraConsent: { read: () => string | null; grant: () => void; deny: () => void } }).TerraConsent };
}

test("no carga medición sin autorización", async () => {
  const pending = await boot();
  assert.equal(pending.consent.read(), null);
  assert.equal(pending.scripts.length, 0);
  pending.consent.deny();
  assert.equal(pending.consent.read(), "denied");
  assert.equal(pending.scripts.length, 0);
});

test("al aceptar carga Analytics, Clarity y los dos píxeles", async () => {
  const accepted = await boot();
  accepted.consent.grant();
  assert.equal(accepted.consent.read(), "granted");
  assert.ok(accepted.scripts.some((src) => src.includes("googletagmanager.com/gtag/js?id=G-T419MSNEWJ")));
  assert.ok(accepted.scripts.some((src) => src.includes("clarity.ms/tag/yvum2tlvam")));
  assert.ok(accepted.scripts.some((src) => src.includes("fbevents.js")));
  const again = await boot("granted");
  assert.ok(again.scripts.some((src) => src.includes("fbevents.js")));
});
