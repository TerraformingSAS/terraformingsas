import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calcularPlanDinamico,
  fechaPeriodo,
  fechaValida,
  type CondicionesDinamicas,
} from "./plan.ts";
import { PARAMETROS_DINAMICOS as P, validarParametrosDinamicos } from "./parametros.ts";

export const EJEMPLO: CondicionesDinamicas = {
  separacion: 5_000_000,
  porcentaje: 100,
  cuotaMensual: 1_000_000,
  periodos: 24,
  fechaSeparacion: "2026-11-30",
  fechaEntrega: "2028-11-30",
  interesesHastaEntrega: true,
  abonos: [],
};
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 0.00001, `${a} ≠ ${b}`);

test("reproduce todos los indicadores del ejemplo del usuario sin redondeo intermedio", () => {
  const p = calcularPlanDinamico(126_626_500, EJEMPLO);
  assert.equal(p.financiado, 121_626_500);
  assert.equal(p.totalCuotas, 24_000_000);
  assert.equal(Math.round(p.interesesTotales), 29_833_416);
  assert.equal(p.totalAntesEntrega, 29_000_000);
  assert.equal(Math.round(p.pagoFinal), 127_459_916);
  assert.equal(Math.round(p.totalPagar), 156_459_916);
  assert.equal(Math.round(p.cuotaSinPagoFinal), 5_725_382);
  assert.equal(p.diferenciaPrimeraCuota, -216_265);
  assert.equal(Math.round(p.variacionSaldo), 5_833_416);
  assert.equal(p.filas.length, 24);
  close(p.totalPagar, p.valorPreventa + p.interesesTotales);
});

test("los intereses no cubiertos se capitalizan y generan intereses en el mes siguiente", () => {
  const p = calcularPlanDinamico(126_626_500, EJEMPLO);
  assert.equal(p.filas[0].interesCapitalizado, 216_265);
  assert.equal(p.filas[0].saldoFinal, 121_842_765);
  close(p.filas[1].interes, 1_218_427.65);
});

test("varios abonos en un mes reducen los intereses futuros; editar/eliminar recompone el plan", () => {
  const original = calcularPlanDinamico(126_626_500, EJEMPLO);
  const abonos = [
    { id: "a", periodo: 12, valor: 6_000_000, concepto: "Prima" },
    { id: "b", periodo: 12, valor: 4_000_000, concepto: "Ahorro" },
  ];
  const p = calcularPlanDinamico(126_626_500, { ...EJEMPLO, abonos });
  assert.equal(p.totalAbonos, 10_000_000);
  close(original.filas[11].interes, p.filas[11].interes);
  close(original.filas[12].interes - p.filas[12].interes, 100_000);
  assert.equal(Math.round(p.pagoFinal), 116_191_666);
  assert.equal(Math.round(original.interesesTotales - p.interesesTotales), 1_268_250);
  const editado = calcularPlanDinamico(126_626_500, {
    ...EJEMPLO,
    abonos: [{ ...abonos[0], valor: 2_000_000 }],
  });
  assert.ok(editado.pagoFinal > p.pagoFinal);
  assert.deepEqual(calcularPlanDinamico(126_626_500, { ...EJEMPLO, abonos: [] }), original);
});

test("70%: la reserva del 30% no causa intereses y se suma una sola vez al pago final", () => {
  const p = calcularPlanDinamico(126_626_500, { ...EJEMPLO, porcentaje: 70 });
  assert.equal(p.financiado, 85_138_550);
  assert.equal(p.reservadoEntrega, 36_487_950);
  close(p.filas[0].interes, 851_385.5);
  close(p.pagoFinal, p.saldoFinanciadoFinal + p.reservadoEntrega);
  close(p.totalPagar, p.valorPreventa + p.interesesTotales);
});

test("plazo libre de 18 meses; 12 meses también aplica la tasa dinámica", () => {
  for (const n of [1, 12, 18, 37, 360]) {
    const p = calcularPlanDinamico(126_626_500, {
      ...EJEMPLO,
      periodos: n,
      fechaEntrega: fechaPeriodo(EJEMPLO.fechaSeparacion, n),
    });
    assert.equal(p.filas.length, n);
    assert.equal(p.filas[0].interes, 1_216_265);
  }
});

test("tasa cero y cuota cero son válidas; la cuota de equilibrio evita dividir por cero", () => {
  const p = calcularPlanDinamico(
    29_000_000,
    { ...EJEMPLO, cuotaMensual: 0 },
    { ...P, tasaMensual: 0 },
  );
  assert.equal(p.interesesTotales, 0);
  assert.equal(p.pagoFinal, 24_000_000);
  assert.equal(p.cuotaSinPagoFinal, 1_000_000);
});

test("una mensualidad muy alta se limita a la deuda y cancela las siguientes", () => {
  const p = calcularPlanDinamico(126_626_500, { ...EJEMPLO, cuotaMensual: 200_000_000 });
  assert.equal(p.filas[0].cuota, 122_842_765);
  assert.equal(p.periodoCancelacion, 1);
  assert.equal(p.pagoFinal, 0);
  assert.ok(p.filas.slice(1).every((f) => f.cuota === 0 && f.interes === 0 && f.saldoFinal === 0));
});

test("un abono excesivo se limita a la parte financiada y conserva la reserva", () => {
  const p = calcularPlanDinamico(126_626_500, {
    ...EJEMPLO,
    porcentaje: 70,
    abonos: [{ id: "a", periodo: 1, valor: 999_000_000, concepto: "Cancelación" }],
  });
  assert.equal(p.periodoCancelacion, 1);
  assert.equal(p.pagoFinal, p.reservadoEntrega);
  assert.equal(p.saldoFinanciadoFinal, 0);
  assert.ok(p.totalAbonos < 999_000_000);
  close(p.totalPagar, p.valorPreventa + p.interesesTotales);
});

test("separación por el total del precio no causa intereses ni mensualidades", () => {
  const p = calcularPlanDinamico(5_000_000, EJEMPLO);
  assert.equal(p.totalPagar, 5_000_000);
  assert.equal(p.pagoFinal, 0);
  assert.equal(p.cuotaSinPagoFinal, 0);
});

test("intereses hasta entrega: meses de espera y fracción efectiva, o congelación explícita", () => {
  const c = { ...EJEMPLO, fechaEntrega: "2029-01-15" };
  const original = calcularPlanDinamico(126_626_500, EJEMPLO);
  const p = calcularPlanDinamico(126_626_500, c);
  assert.equal(p.filas.length, 26);
  assert.equal(p.filas[24].tipo, "espera");
  assert.equal(p.filas[24].cuota, 0);
  close(p.pagoFinal, original.pagoFinal * 1.01 * 1.01 ** (15 / 31));
  const congelado = calcularPlanDinamico(126_626_500, { ...c, interesesHastaEntrega: false });
  assert.equal(congelado.pagoFinal, original.pagoFinal);
  close(p.totalPagar, p.valorPreventa + p.interesesTotales);
});

test("calendario conserva fin de mes, año bisiesto y ancla sin deriva", () => {
  assert.equal(fechaPeriodo("2026-11-30", 1), "2026-12-31");
  assert.equal(fechaPeriodo("2028-01-31", 1), "2028-02-29");
  assert.equal(fechaPeriodo("2028-01-31", 2), "2028-03-31");
  assert.equal(fechaPeriodo("2027-01-30", 1), "2027-02-28");
  assert.equal(fechaPeriodo("2027-01-30", 2), "2027-03-30");
  assert.equal(fechaValida("2027-02-29"), false);
  assert.equal(fechaValida("2028-02-29"), true);
});

test("rechaza mínimos, importes, plazos, fechas y abonos inválidos", () => {
  const cases = [
    { separacion: 4_999_999 },
    { separacion: 999_999_999 },
    { cuotaMensual: -1 },
    { cuotaMensual: NaN },
    { periodos: 0 },
    { periodos: 1.5 },
    { periodos: 361 },
    { porcentaje: 30 },
    { fechaSeparacion: "2026-02-30" },
    { fechaEntrega: "2027-01-01" },
    { abonos: [{ id: "a", periodo: 25, valor: 100, concepto: "" }] },
    { abonos: [{ id: "a", periodo: 1, valor: Infinity, concepto: "" }] },
    { abonos: [{ id: "a", periodo: 1, valor: 0, concepto: "" }] },
    {
      abonos: [
        { id: "a", periodo: 1, valor: 100, concepto: "" },
        { id: "a", periodo: 2, valor: 100, concepto: "" },
      ],
    },
  ];
  for (const change of cases)
    assert.throws(() =>
      calcularPlanDinamico(126_626_500, { ...EJEMPLO, ...change } as CondicionesDinamicas),
    );
});

test("parámetros propios: valida tasa cero y rechaza configuraciones inconsistentes", () => {
  assert.equal(validarParametrosDinamicos({ ...P, tasaMensual: 0 }).tasaMensual, 0);
  for (const change of [
    { tasaMensual: -1 },
    { tasaMensual: 1 },
    { periodos: 25, maxPeriodos: 24 },
    { cuotaMensual: "100" },
    { maxPeriodos: 999 },
    { separacionMinima: -1 },
  ]) {
    assert.throws(() => validarParametrosDinamicos({ ...P, ...change }));
  }
});
