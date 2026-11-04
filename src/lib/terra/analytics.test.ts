import assert from "node:assert/strict";
import { test } from "node:test";
import { resetAnalyticsOnceKeys, trackTerraEvent } from "./analytics.ts";

test("no envía PII y dispara generate_lead una sola vez por clave", () => {
  const events: unknown[][] = [];
  const leads: unknown[][] = [];
  const gtag = (...args: unknown[]) => events.push(args);
  const fbq = (...args: unknown[]) => leads.push(args);
  (globalThis as { window?: unknown }).window = { gtag, fbq };
  resetAnalyticsOnceKeys();
  trackTerraEvent(
    "generate_lead",
    { lot_id: "C-12", email: "oculto@test.com", nombre: "Ana" },
    { onceKey: "lead-test" },
  );
  trackTerraEvent("generate_lead", { lot_id: "C-12" }, { onceKey: "lead-test" });
  assert.equal(events.length, 1);
  assert.deepEqual(events[0], ["event", "generate_lead", { lot_id: "C-12" }]);
  assert.equal(leads.length, 1);
  assert.equal(leads[0][0], "track");
  assert.equal(leads[0][1], "Lead");
});
