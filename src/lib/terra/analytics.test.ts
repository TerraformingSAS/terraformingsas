import assert from "node:assert/strict";
import { test } from "node:test";
import { metaPixelCalls, resetAnalyticsOnceKeys, trackTerraEvent } from "./analytics.ts";

test("no envía PII y dispara Lead una sola vez por clave", () => {
  const events: unknown[][] = [];
  const pixel: unknown[][] = [];
  const gtag = (...args: unknown[]) => events.push(args);
  const fbq = (...args: unknown[]) => pixel.push(args);
  (globalThis as { window?: unknown }).window = { gtag, fbq };
  resetAnalyticsOnceKeys();
  trackTerraEvent(
    "generate_lead",
    { lot_id: "C-12", email: "oculto@test.com", nombre: "Ana", value: 1000 },
    { onceKey: "lead-test" },
  );
  trackTerraEvent("generate_lead", { lot_id: "C-12" }, { onceKey: "lead-test" });
  assert.equal(events.length, 1);
  assert.deepEqual(events[0], ["event", "generate_lead", { lot_id: "C-12", value: 1000 }]);
  assert.deepEqual(pixel[0], [
    "track",
    "Lead",
    {
      content_name: "TERRA",
      content_category: "quote_request",
      content_ids: ["C-12"],
      content_type: "product",
      value: 1000,
      currency: "COP",
    },
  ]);
  assert.equal(pixel[1][0], "trackCustom");
  assert.equal(pixel[1][1], "generate_lead");
  assert.equal(pixel.length, 2);
});

test("mapea las acciones del sitio a eventos estándar sin Purchase", () => {
  const view = metaPixelCalls("select_lot", { lot_id: "A-03", location: "mapa" });
  assert.equal(view[0].name, "ViewContent");
  assert.deepEqual(view[0].params.content_ids, ["A-03"]);

  const search = metaPixelCalls("search", { search_string: "manzana B", location: "visor" });
  assert.equal(search[0].name, "Search");
  assert.equal(search[0].params.search_string, "manzana B");

  const contact = metaPixelCalls("whatsapp_click", { location: "header" });
  assert.equal(contact[0].name, "Contact");

  const plan = metaPixelCalls("select_financing_plan", { plan: "70%", location: "cotizador" });
  assert.equal(plan[0].name, "CustomizeProduct");

  const quote = metaPixelCalls("view_quote", { lot_id: "C-12", value: 250000000, location: "cotizador" });
  assert.equal(quote[0].name, "ViewContent");
  assert.equal(quote[0].params.currency, "COP");
  assert.equal(quote[0].params.value, 250000000);

  const start = metaPixelCalls("form_start", { page: "/terra" });
  assert.deepEqual(start.map((call) => call.method), ["trackCustom"]);
  assert.equal(
    [view, search, contact, plan, quote, start].some((calls) => calls.some((call) => call.name === "Purchase")),
    false,
  );
});
