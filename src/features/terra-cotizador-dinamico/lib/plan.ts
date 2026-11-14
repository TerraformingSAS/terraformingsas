import { PARAMETROS_DINAMICOS, type ParametrosDinamicos } from "./parametros.ts";

export type AbonoDinamico = { id: string; periodo: number; valor: number; concepto: string };
export type CondicionesDinamicas = {
  separacion: number;
  porcentaje: 70 | 100;
  cuotaMensual: number;
  periodos: number;
  fechaSeparacion: string;
  fechaEntrega: string;
  interesesHastaEntrega: boolean;
  abonos: AbonoDinamico[];
};
export type FilaPlan = {
  periodo: number;
  fecha: string;
  tipo: "mensualidad" | "espera";
  saldoInicial: number;
  interes: number;
  interesCapitalizado: number;
  cuota: number;
  abonos: number;
  abonosSolicitados: number;
  saldoFinal: number;
};
export type PlanDinamico = {
  valorPreventa: number;
  separacion: number;
  tasaMensual: number;
  saldoInicial: number;
  financiado: number;
  reservadoEntrega: number;
  filas: FilaPlan[];
  totalCuotas: number;
  totalAbonos: number;
  interesesTotales: number;
  interesesCapitalizados: number;
  saldoFinanciadoFinal: number;
  pagoFinal: number;
  totalAntesEntrega: number;
  totalPagar: number;
  cuotaSinPagoFinal: number;
  diferenciaPrimeraCuota: number;
  variacionSaldo: number;
  periodoCancelacion: number | null;
};

const EPSILON = 0.000001;
const DIA = 86_400_000;

export function fechaValida(value: string): boolean {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    value >= "2000-01-01" &&
    value <= "2200-12-31" &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value + "T00:00:00Z").toISOString().slice(0, 10) === value
  );
}

/** Conserva el día de la separación; enero 31 → febrero 28 → marzo 31. */
export function fechaPeriodo(fecha: string, meses: number): string {
  if (!fechaValida(fecha) || !Number.isInteger(meses) || meses < 0 || meses > 720) {
    throw new Error("Fecha o período inválido.");
  }
  const [year, month, day] = fecha.split("-").map(Number);
  const finDeMes = day === new Date(Date.UTC(year, month, 0)).getUTCDate();
  const first = new Date(Date.UTC(year, month - 1 + meses, 1));
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  return new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), finDeMes ? last : Math.min(day, last)),
  )
    .toISOString()
    .slice(0, 10);
}

export function validarCondiciones(
  value: unknown,
  valorPreventa: number,
  parametros: ParametrosDinamicos = PARAMETROS_DINAMICOS,
): CondicionesDinamicas {
  if (!value || typeof value !== "object") throw new Error("Faltan las condiciones del plan.");
  const c = value as CondicionesDinamicas;
  if (!Number.isFinite(valorPreventa) || valorPreventa <= 0 || valorPreventa > 1e12)
    throw new Error("Precio del lote inválido.");
  if (
    typeof c.separacion !== "number" ||
    !Number.isFinite(c.separacion) ||
    c.separacion < parametros.separacionMinima ||
    c.separacion > valorPreventa
  ) {
    throw new Error("La separación debe cumplir el mínimo y no superar el precio del lote.");
  }
  if (c.porcentaje !== 70 && c.porcentaje !== 100)
    throw new Error("Selecciona financiación del 70% o 100%.");
  if (
    typeof c.cuotaMensual !== "number" ||
    !Number.isFinite(c.cuotaMensual) ||
    c.cuotaMensual < 0 ||
    c.cuotaMensual > 1e12
  )
    throw new Error("Cuota mensual inválida.");
  if (!Number.isInteger(c.periodos) || c.periodos < 1 || c.periodos > parametros.maxPeriodos)
    throw new Error(`El plazo debe estar entre 1 y ${parametros.maxPeriodos} meses.`);
  if (!fechaValida(c.fechaSeparacion) || !fechaValida(c.fechaEntrega))
    throw new Error("Ingresa fechas válidas de separación y entrega.");
  if (c.fechaEntrega < fechaPeriodo(c.fechaSeparacion, c.periodos))
    throw new Error("La entrega no puede ser anterior a la última mensualidad.");
  if (c.fechaEntrega > fechaPeriodo(c.fechaSeparacion, 360))
    throw new Error("La entrega no puede superar 360 meses desde la separación.");
  if (typeof c.interesesHastaEntrega !== "boolean")
    throw new Error("Indica si se generan intereses hasta la entrega.");
  if (!Array.isArray(c.abonos) || c.abonos.length > 1000)
    throw new Error("Se permiten hasta 1.000 abonos.");
  const ids = new Set<string>();
  const abonos = c.abonos.map((a) => {
    if (!a || typeof a.id !== "string" || !a.id || a.id.length > 100 || ids.has(a.id))
      throw new Error("Identificador de abono inválido o duplicado.");
    ids.add(a.id);
    if (!Number.isInteger(a.periodo) || a.periodo < 1 || a.periodo > c.periodos)
      throw new Error("Hay abonos fuera del plazo de mensualidades. Reubícalos o elimínalos.");
    if (typeof a.valor !== "number" || !Number.isFinite(a.valor) || a.valor <= 0 || a.valor > 1e12)
      throw new Error("Cada abono debe tener un valor mayor que cero.");
    if (typeof a.concepto !== "string" || a.concepto.length > 160)
      throw new Error("El concepto del abono admite hasta 160 caracteres.");
    return { id: a.id, periodo: a.periodo, valor: a.valor, concepto: a.concepto.trim() };
  });
  return {
    separacion: c.separacion,
    porcentaje: c.porcentaje,
    cuotaMensual: c.cuotaMensual,
    periodos: c.periodos,
    fechaSeparacion: c.fechaSeparacion,
    fechaEntrega: c.fechaEntrega,
    interesesHastaEntrega: c.interesesHastaEntrega,
    abonos,
  };
}

export function calcularPlanDinamico(
  valorPreventa: number,
  condiciones: CondicionesDinamicas,
  parametros: ParametrosDinamicos = PARAMETROS_DINAMICOS,
): PlanDinamico {
  const c = validarCondiciones(condiciones, valorPreventa, parametros);
  const r = parametros.tasaMensual;
  if (!Number.isFinite(r) || r < 0 || r > 0.1) throw new Error("Tasa mensual inválida.");
  const saldoInicial = valorPreventa - c.separacion;
  const financiado = (saldoInicial * c.porcentaje) / 100;
  const reservadoEntrega = saldoInicial - financiado;
  let saldo = financiado;
  let periodoCancelacion: number | null = financiado === 0 ? 0 : null;
  const filas: FilaPlan[] = [];
  const extras = new Map<number, number>();
  for (const a of c.abonos) extras.set(a.periodo, (extras.get(a.periodo) ?? 0) + a.valor);

  function agregar(periodo: number, fecha: string, tipo: FilaPlan["tipo"], factor: number) {
    const saldoInicial = saldo;
    const interes = saldo * factor;
    const deuda = saldo + interes;
    const cuota = tipo === "mensualidad" ? Math.min(c.cuotaMensual, deuda) : 0;
    const abonosSolicitados = tipo === "mensualidad" ? (extras.get(periodo) ?? 0) : 0;
    const abonos = Math.min(abonosSolicitados, Math.max(0, deuda - cuota));
    saldo = Math.max(0, deuda - cuota - abonos);
    if (saldo < EPSILON) saldo = 0;
    if (!Number.isFinite(saldo) || saldo > Number.MAX_SAFE_INTEGER)
      throw new Error(
        "El saldo proyectado excede el límite de cálculo. Revisa plazo, tasa y pagos.",
      );
    if (saldo === 0 && periodoCancelacion === null) periodoCancelacion = periodo;
    filas.push({
      periodo,
      fecha,
      tipo,
      saldoInicial,
      interes,
      interesCapitalizado: Math.max(0, interes - cuota - abonos),
      cuota,
      abonos,
      abonosSolicitados,
      saldoFinal: saldo,
    });
  }

  // Se conservan los N períodos; después de cancelar, cuotas e intereses son cero.
  for (let m = 1; m <= c.periodos; m++)
    agregar(m, fechaPeriodo(c.fechaSeparacion, m), "mensualidad", r);
  if (c.interesesHastaEntrega) {
    let m = c.periodos + 1;
    let anterior = fechaPeriodo(c.fechaSeparacion, c.periodos);
    while (fechaPeriodo(c.fechaSeparacion, m) <= c.fechaEntrega) {
      anterior = fechaPeriodo(c.fechaSeparacion, m);
      agregar(m, anterior, "espera", r);
      m++;
    }
    if (anterior < c.fechaEntrega) {
      const dias = (Date.parse(c.fechaEntrega) - Date.parse(anterior)) / DIA;
      const diasMes = (Date.parse(fechaPeriodo(c.fechaSeparacion, m)) - Date.parse(anterior)) / DIA;
      agregar(m, c.fechaEntrega, "espera", Math.expm1((Math.log1p(r) * dias) / diasMes));
    }
  }
  const sum = (key: "cuota" | "abonos" | "interes" | "interesCapitalizado") =>
    filas.reduce((n, f) => n + f[key], 0);
  const totalCuotas = sum("cuota"),
    totalAbonos = sum("abonos"),
    interesesTotales = sum("interes");
  const totalAntesEntrega = c.separacion + totalCuotas + totalAbonos;
  const pagoFinal = saldo + reservadoEntrega;
  const cuotaSinPagoFinal =
    r === 0 ? financiado / c.periodos : (financiado * r) / -Math.expm1(-c.periodos * Math.log1p(r));
  return {
    valorPreventa,
    separacion: c.separacion,
    tasaMensual: r,
    saldoInicial,
    financiado,
    reservadoEntrega,
    filas,
    totalCuotas,
    totalAbonos,
    interesesTotales,
    interesesCapitalizados: sum("interesCapitalizado"),
    saldoFinanciadoFinal: saldo,
    pagoFinal,
    totalAntesEntrega,
    totalPagar: totalAntesEntrega + pagoFinal,
    cuotaSinPagoFinal,
    diferenciaPrimeraCuota: c.cuotaMensual - financiado * r,
    variacionSaldo: saldo - financiado,
    periodoCancelacion,
  };
}
