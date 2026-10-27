import assert from "node:assert/strict";
import { test } from "node:test";
import {
  SEPARACION_COP,
  calcularCuota,
  calcularFinanciacion,
} from "./financiacion.ts";

/** Casos oficiales de financiación al 70%. No se usan como resultados fijos en producción. */
const TABLA_70 = [
  {
    area: 120,
    preventa: 74_100_000,
    financiar: 48_370_000,
    cuota12: 4_030_833,
    cuota24: 2_276_944,
    cuota36: 1_606_576,
    contraEntrega: 20_730_000,
  },
  {
    area: 154,
    preventa: 93_093_000,
    financiar: 61_665_100,
    cuota12: 5_138_758,
    cuota24: 2_902_790,
    cuota36: 2_048_164,
    contraEntrega: 26_427_900,
  },
  {
    area: 165,
    preventa: 99_313_500,
    financiar: 66_019_450,
    cuota12: 5_501_621,
    cuota24: 3_107_765,
    cuota36: 2_192_790,
    contraEntrega: 28_294_050,
  },
  {
    area: 211.75,
    preventa: 126_626_500,
    financiar: 85_138_550,
    cuota12: 7_094_879,
    cuota24: 4_007_767,
    cuota36: 2_827_818,
    contraEntrega: 36_487_950,
  },
  {
    area: 442.75,
    preventa: 259_008_750,
    financiar: 177_806_125,
    cuota12: 14_817_177,
    cuota24: 8_369_952,
    cuota36: 5_905_708,
    contraEntrega: 76_202_625,
  },
] as const;

const peso = (a: number, b: number) => Math.abs(a - b) <= 1;

for (const fila of TABLA_70) {
  test(`70% · ${fila.area} m² · saldo, financiar, cuotas y contra entrega`, () => {
    const plan = calcularFinanciacion(fila.preventa, 70, 12);
    assert.equal(plan.separacion, SEPARACION_COP);
    assert.equal(plan.saldo, fila.preventa - SEPARACION_COP);
    assert.ok(peso(plan.valorFinanciar, fila.financiar), `${plan.valorFinanciar} ≠ ${fila.financiar}`);
    assert.ok(peso(plan.saldoContraEntrega, fila.contraEntrega));
    assert.ok(peso(plan.cuota, fila.cuota12));
    assert.ok(peso(calcularCuota(plan.valorFinanciar, 24), fila.cuota24));
    assert.ok(peso(calcularCuota(plan.valorFinanciar, 36), fila.cuota36));
    assert.equal(plan.saldo, plan.valorFinanciar + plan.saldoContraEntrega);
  });
}

for (const fila of TABLA_70) {
  test(`100% · ${fila.area} m² · saldo completo y $0 contra entrega`, () => {
    const plan = calcularFinanciacion(fila.preventa, 100, 12);
    const saldo = fila.preventa - SEPARACION_COP;
    assert.equal(plan.saldo, saldo);
    assert.equal(plan.valorFinanciar, saldo);
    assert.equal(plan.saldoContraEntrega, 0);
    assert.ok(peso(plan.cuota, calcularCuota(saldo, 12)));
    assert.ok(peso(calcularCuota(saldo, 24), calcularFinanciacion(fila.preventa, 100, 24).cuota));
    assert.ok(peso(calcularCuota(saldo, 36), calcularFinanciacion(fila.preventa, 100, 36).cuota));
  });
}

test("12 meses no aplica el 1%; 24 y 36 sí usan PAGO", () => {
  const pv = 48_370_000;
  assert.equal(calcularCuota(pv, 12), Math.round(pv / 12));
  const tasa = 0.01;
  for (const meses of [24, 36] as const) {
    const factor = Math.pow(1 + tasa, meses);
    assert.equal(calcularCuota(pv, meses), Math.round((pv * (tasa * factor)) / (factor - 1)));
  }
  assert.throws(() => calcularCuota(pv, 18));
});
