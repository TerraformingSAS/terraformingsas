export const SEPARACION_COP = 5_000_000;
export const TASA_MENSUAL = 0.01;
export const PLANES_MESES = [12, 24, 36] as const;
export const PORCENTAJES = [70, 100] as const;

export type PlanMeses = (typeof PLANES_MESES)[number];
export type PorcentajeFinanciacion = (typeof PORCENTAJES)[number];

export type PlanFinanciacion = {
  porcentaje: PorcentajeFinanciacion;
  meses: PlanMeses;
  valorPreventa: number;
  separacion: number;
  saldo: number;
  valorFinanciar: number;
  saldoContraEntrega: number;
  cuota: number;
  cuotas: { meses: PlanMeses; valor: number }[];
};

export function esPlanMeses(n: number): n is PlanMeses {
  return n === 12 || n === 24 || n === 36;
}

export function esPorcentaje(n: number): n is PorcentajeFinanciacion {
  return n === 70 || n === 100;
}

/** Cuota mensual. 12 meses sin interés; 24 y 36 con PAGO de Excel al 1% mensual. */
export function calcularCuota(valorFinanciar: number, meses: number): number {
  if (meses === 12) return Math.round(valorFinanciar / 12);
  if (meses !== 24 && meses !== 36) throw new Error("Plazo de financiación no permitido");
  const factor = Math.pow(1 + TASA_MENSUAL, meses);
  return Math.round((valorFinanciar * (TASA_MENSUAL * factor)) / (factor - 1));
}

/** Saldo = preventa − $5.000.000. El porcentaje se aplica sobre ese saldo, nunca antes. */
export function calcularFinanciacion(
  valorPreventa: number,
  porcentaje: PorcentajeFinanciacion,
  meses: PlanMeses,
): PlanFinanciacion {
  const saldo = Math.round(valorPreventa - SEPARACION_COP);
  const valorFinanciar = Math.round(saldo * (porcentaje / 100));
  const saldoContraEntrega = saldo - valorFinanciar;
  const cuotas = PLANES_MESES.map((m) => ({ meses: m, valor: calcularCuota(valorFinanciar, m) }));
  return {
    porcentaje,
    meses,
    valorPreventa,
    separacion: SEPARACION_COP,
    saldo,
    valorFinanciar,
    saldoContraEntrega,
    cuota: calcularCuota(valorFinanciar, meses),
    cuotas,
  };
}
