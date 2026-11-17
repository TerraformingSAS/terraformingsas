import assert from "node:assert/strict";
import { test } from "node:test";
import { SEPARACION_COP, calcularFinanciacion, type PlanMeses, type PorcentajeFinanciacion } from "./financiacion.ts";
import { TARIFA_PREVENTA_DEFAULT } from "./parametros.ts";

/**
 * Diez escenarios comerciales sobre la tabla oficial de lotes.
 * Cada caso fija área, porcentaje y plazo, y compara contra cifras calculadas
 * a partir del valor de preventa de esa área.
 */
const ESCENARIOS: {
  nombre: string;
  area: number;
  porcentaje: PorcentajeFinanciacion;
  meses: PlanMeses;
  saldo: number;
  financiar: number;
  contraEntrega: number;
  cuota: number;
}[] = [
  {
    nombre: "120 m² · 70% a 12 meses, sin interés",
    area: 120,
    porcentaje: 70,
    meses: 12,
    saldo: 69_100_000,
    financiar: 48_370_000,
    contraEntrega: 20_730_000,
    cuota: 4_030_833,
  },
  {
    nombre: "120 m² · 100% a 36 meses, con factor PAGO",
    area: 120,
    porcentaje: 100,
    meses: 36,
    saldo: 69_100_000,
    financiar: 69_100_000,
    contraEntrega: 0,
    cuota: 2_295_109,
  },
  {
    nombre: "154 m² · 70% a 24 meses",
    area: 154,
    porcentaje: 70,
    meses: 24,
    saldo: 88_093_000,
    financiar: 61_665_100,
    contraEntrega: 26_427_900,
    cuota: 2_902_790,
  },
  {
    nombre: "154 m² · 100% a 12 meses",
    area: 154,
    porcentaje: 100,
    meses: 12,
    saldo: 88_093_000,
    financiar: 88_093_000,
    contraEntrega: 0,
    cuota: 7_341_083,
  },
  {
    nombre: "165 m² · 100% a 24 meses",
    area: 165,
    porcentaje: 100,
    meses: 24,
    saldo: 94_313_500,
    financiar: 94_313_500,
    contraEntrega: 0,
    cuota: 4_439_664,
  },
  {
    nombre: "165 m² · 70% a 36 meses",
    area: 165,
    porcentaje: 70,
    meses: 36,
    saldo: 94_313_500,
    financiar: 66_019_450,
    contraEntrega: 28_294_050,
    cuota: 2_192_790,
  },
  {
    nombre: "211.75 m² · 70% a 12 meses",
    area: 211.75,
    porcentaje: 70,
    meses: 12,
    saldo: 121_626_500,
    financiar: 85_138_550,
    contraEntrega: 36_487_950,
    cuota: 7_094_879,
  },
  {
    nombre: "211.75 m² · 100% a 36 meses",
    area: 211.75,
    porcentaje: 100,
    meses: 36,
    saldo: 121_626_500,
    financiar: 121_626_500,
    contraEntrega: 0,
    cuota: 4_039_740,
  },
  {
    nombre: "442.75 m² · 70% a 24 meses",
    area: 442.75,
    porcentaje: 70,
    meses: 24,
    saldo: 254_008_750,
    financiar: 177_806_125,
    contraEntrega: 76_202_625,
    cuota: 8_369_952,
  },
  {
    nombre: "442.75 m² · 100% a 12 meses",
    area: 442.75,
    porcentaje: 100,
    meses: 12,
    saldo: 254_008_750,
    financiar: 254_008_750,
    contraEntrega: 0,
    cuota: 21_167_396,
  },
];

for (const caso of ESCENARIOS) {
  test(caso.nombre, () => {
    const lote = TARIFA_PREVENTA_DEFAULT.find((fila) => fila.area === caso.area);
    assert.ok(lote, `sin tarifa para ${caso.area} m²`);
    const plan = calcularFinanciacion(lote.preventa, caso.porcentaje, caso.meses);

    assert.equal(plan.valorPreventa, lote.preventa);
    assert.equal(plan.separacion, SEPARACION_COP);
    assert.equal(plan.saldo, caso.saldo);
    assert.equal(plan.saldo, lote.preventa - SEPARACION_COP);
    assert.equal(plan.valorFinanciar, caso.financiar);
    assert.equal(plan.saldoContraEntrega, caso.contraEntrega);
    assert.equal(plan.cuota, caso.cuota);
    assert.equal(plan.separacion + plan.valorFinanciar + plan.saldoContraEntrega, lote.preventa);
    assert.equal(plan.valorFinanciar + plan.saldoContraEntrega, plan.saldo);

    const elegida = plan.cuotas.find((cuota) => cuota.meses === caso.meses);
    assert.equal(elegida?.valor, caso.cuota);
    assert.deepEqual(
      plan.cuotas.map((cuota) => cuota.meses),
      [12, 24, 36],
    );

    if (caso.meses === 12) {
      assert.ok(Math.abs(plan.cuota * 12 - plan.valorFinanciar) < 12);
    } else {
      assert.ok(plan.cuota * caso.meses > plan.valorFinanciar);
    }
    if (caso.porcentaje === 100) assert.equal(plan.saldoContraEntrega, 0);
  });
}
