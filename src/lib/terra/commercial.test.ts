import assert from "node:assert/strict";
import { test } from "node:test";
import { SEPARACION_COP } from "../../features/terra-cotizador/lib/financiacion.ts";
import {
  TERRA_FINANCING,
  activeDatedCampaigns,
  formatCopMillions,
  isDatedCampaignActive,
} from "./commercial.ts";

test("la separación pública coincide con el cotizador", () => {
  assert.equal(TERRA_FINANCING.separacionCop, SEPARACION_COP);
  assert.equal(TERRA_FINANCING.financedPercent, 70);
  assert.equal(TERRA_FINANCING.deliveryPercent, 30);
  assert.deepEqual([...TERRA_FINANCING.plansMonths], [12, 24, 36]);
});

test("los descuentos originales no se publican después del 31 de octubre de 2026", () => {
  const afterDeadline = new Date("2026-11-03T12:00:00-05:00");
  assert.equal(isDatedCampaignActive("descuentos-originales", afterDeadline), false);
  assert.equal(
    activeDatedCampaigns(afterDeadline).some((c) => c.id === "descuentos-originales"),
    false,
  );
});

test("una campaña fechada sigue activa antes de su cierre", () => {
  const before = new Date("2026-10-30T12:00:00-05:00");
  assert.equal(isDatedCampaignActive("descuentos-originales", before), true);
});

test("formatea la separación en millones", () => {
  assert.equal(formatCopMillions(5_000_000), "$5 millones");
});
