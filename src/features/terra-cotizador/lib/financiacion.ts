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

export type OpcionesFinanciacion = {
  separacionCop?: number;
  tasaMensual?: number;
  planesMeses?: number[];
};

export function esPlanMeses(n: number): n is PlanMeses {
  return n === 12 || n === 24 || n === 36;
}

export function esPorcentaje(n: number): n is PorcentajeFinanciacion {
  return n === 70 || n === 100;
}

/** Cuota mensual. 12 meses sin interés; 24 y 36 con factor tipo PAGO. */
export function calcularCuota(
  valorFinanciar: number,
  meses: number,
  tasaMensual: number = TASA_MENSUAL,
): number {
  if (meses === 12) return Math.round(valorFinanciar / 12);
  if (meses !== 24 && meses !== 36) throw new Error("Plazo de financiación no permitido");
  const r = tasaMensual > 0 ? tasaMensual : TASA_MENSUAL;
  const factor = Math.pow(1 + r, meses);
  return Math.round((valorFinanciar * (r * factor)) / (factor - 1));
}

/** Saldo = preventa − separación. El porcentaje se aplica sobre ese saldo, nunca antes. */
export function calcularFinanciacion(
  valorPreventa: number,
  porcentaje: PorcentajeFinanciacion,
  meses: PlanMeses,
  opciones: OpcionesFinanciacion = {},
): PlanFinanciacion {
  const separacion = opciones.separacionCop ?? SEPARACION_COP;
  const tasa = opciones.tasaMensual ?? TASA_MENSUAL;
  const planes = (opciones.planesMeses?.filter(esPlanMeses) as PlanMeses[] | undefined) ?? [
    ...PLANES_MESES,
  ];
  const saldo = Math.round(valorPreventa - separacion);
  const valorFinanciar = Math.round(saldo * (porcentaje / 100));
  const saldoContraEntrega = saldo - valorFinanciar;
  const cuotas = planes.map((m) => ({ meses: m, valor: calcularCuota(valorFinanciar, m, tasa) }));
  return {
    porcentaje,
    meses,
    valorPreventa,
    separacion,
    saldo,
    valorFinanciar,
    saldoContraEntrega,
    cuota: calcularCuota(valorFinanciar, meses, tasa),
    cuotas,
  };
}
