export type ParametrosDinamicos = {
  separacionMinima: number;
  tasaMensual: number;
  cuotaMensual: number;
  periodos: number;
  maxPeriodos: number;
};

export const PARAMETROS_DINAMICOS: ParametrosDinamicos = {
  separacionMinima: 5_000_000,
  tasaMensual: 0.01,
  cuotaMensual: 1_000_000,
  periodos: 24,
  maxPeriodos: 360,
};

export function validarParametrosDinamicos(value: unknown): ParametrosDinamicos {
  if (!value || typeof value !== "object") throw new Error("Parámetros incompletos.");
  const p = value as ParametrosDinamicos;
  for (const key of Object.keys(PARAMETROS_DINAMICOS) as (keyof ParametrosDinamicos)[]) {
    if (typeof p[key] !== "number" || !Number.isFinite(p[key])) {
      throw new Error(`El parámetro ${key} debe ser numérico.`);
    }
  }
  if (
    p.separacionMinima < 0 ||
    p.separacionMinima > 1e12 ||
    p.cuotaMensual < 0 ||
    p.cuotaMensual > 1e12
  ) {
    throw new Error("La separación y la cuota deben estar entre $0 y $1 billón.");
  }
  if (p.tasaMensual < 0 || p.tasaMensual > 0.1) {
    throw new Error("La tasa debe estar entre 0% y 10% mensual.");
  }
  if (
    !Number.isInteger(p.maxPeriodos) ||
    p.maxPeriodos < 1 ||
    p.maxPeriodos > 360 ||
    !Number.isInteger(p.periodos) ||
    p.periodos < 1 ||
    p.periodos > p.maxPeriodos
  ) {
    throw new Error("Los períodos deben ser enteros entre 1 y el máximo permitido (hasta 360).");
  }
  return Object.fromEntries(
    Object.keys(PARAMETROS_DINAMICOS).map((k) => [k, p[k as keyof ParametrosDinamicos]]),
  ) as ParametrosDinamicos;
}
