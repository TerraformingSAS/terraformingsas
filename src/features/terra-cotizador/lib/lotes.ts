import { apiFetch } from "@/features/terra-cotizador/lib/actividad";
import { NoAutorizado, leerMotivo } from "@/features/terra-cotizador/lib/auth";
import { SEPARACION_COP } from "./financiacion";

const COLUMNS = [
  "No",
  "ID",
  "ID_Lote",
  "Etapa",
  "Manzana",
  "Lote",
  "Area_m2",
  "ValorLote",
  "DescuentoPreventa",
  "ValorPreventa",
  "ValorM2",
  "Separacion",
  "SaldoCuotaIinicial",
  "ValorFinanciar",
  "Cuota12",
  "Cuota24",
  "Cuota36",
  "Estado",
] as const;

export type Estado = "disponible" | "reservado" | "negociacion" | "vendido" | "no_disponible";

export const ESTADOS: { key: Estado; label: string; tile: string; dot: string }[] = [
  {
    key: "disponible",
    label: "Disponible",
    tile: "bg-[#5db98a] border-[#4aa676]",
    dot: "bg-[#5db98a]",
  },
  {
    key: "reservado",
    label: "Reservado",
    tile: "bg-[#f0cf73] border-[#dcb955]",
    dot: "bg-[#f0cf73]",
  },
  {
    key: "negociacion",
    label: "En negociación",
    tile: "bg-[#82badb] border-[#68a5ca]",
    dot: "bg-[#82badb]",
  },
  { key: "vendido", label: "Vendido", tile: "bg-[#e2847a] border-[#cf6e64]", dot: "bg-[#e2847a]" },
  {
    key: "no_disponible",
    label: "No disponible",
    tile: "bg-[#b8bab4] border-[#a3a59f]",
    dot: "bg-[#b8bab4]",
  },
];
export const estadoInfo = (e: Estado) => ESTADOS.find((x) => x.key === e)!;

/** Tabla oficial de preventa por tamaño. La cotización se niega si el Excel difiere. */
export const TARIFA_PREVENTA = [
  { area: 120, valorM2: 617_500, preventa: 74_100_000 },
  { area: 154, valorM2: 604_500, preventa: 93_093_000 },
  { area: 165, valorM2: 601_900, preventa: 99_313_500 },
  { area: 211.75, valorM2: 598_000, preventa: 126_626_500 },
  { area: 442.75, valorM2: 585_000, preventa: 259_008_750 },
] as const;

export function diferenciasTarifa(lote: Pick<Lote, "idLote" | "area" | "valorM2" | "valorPreventa">): string[] {
  const fila = TARIFA_PREVENTA.find((t) => Math.abs(lote.area - t.area) <= 0.05);
  if (!fila) {
    const tamanos = TARIFA_PREVENTA.map((t) => fmtNum(t.area)).join(", ");
    return [
      `El lote ${lote.idLote} mide ${fmtNum(lote.area)} m² y ese tamaño no está en la tabla de preventa (${tamanos}).`,
    ];
  }
  const mensajes: string[] = [];
  if (Math.abs(lote.valorM2 - fila.valorM2) > 1) {
    mensajes.push(
      `El Excel trae ${fmtCOP(lote.valorM2)} por m² y la tabla de ${fmtNum(fila.area)} m² indica ${fmtCOP(fila.valorM2)}.`,
    );
  }
  if (Math.abs(lote.valorPreventa - fila.preventa) > 1) {
    mensajes.push(
      `El Excel trae preventa de ${fmtCOP(lote.valorPreventa)} y la tabla de ${fmtNum(fila.area)} m² indica ${fmtCOP(fila.preventa)}.`,
    );
  }
  return mensajes;
}

function cuadra(actual: number, esperado: number): boolean {
  if (!Number.isFinite(actual) || !Number.isFinite(esperado)) return false;
  return Math.abs(actual - esperado) <= Math.max(2, Math.abs(esperado) * 0.005);
}

/** Rechaza la cotización si el Excel no coincide con la tabla de preventa. */
export function inconsistenciasExcel(lote: Lote): string[] {
  const mensajes: string[] = [...diferenciasTarifa(lote)];
  const montos = [lote.area, lote.valorLote, lote.descuento, lote.valorPreventa, lote.valorM2];
  if (montos.some((n) => !Number.isFinite(n) || n < 0)) {
    mensajes.push("El Excel tiene valores vacíos o no numéricos en este lote.");
  }
  if (!(lote.descuento >= 0 && lote.descuento < 1)) {
    mensajes.push("El descuento de preventa del Excel no está entre 0% y 100%.");
  }
  if (!cuadra(lote.valorPreventa, lote.valorLote * (1 - lote.descuento))) {
    mensajes.push("El valor de preventa no coincide con el valor comercial menos el descuento.");
  }
  if (!(lote.area > 0) || !cuadra(lote.valorM2, lote.valorPreventa / lote.area)) {
    mensajes.push("El valor por m² no coincide con el valor de preventa dividido por el área.");
  }
  if (Number.isFinite(lote.separacion) && Math.abs(lote.separacion - SEPARACION_COP) > 1) {
    mensajes.push(
      `El Excel trae separación de ${fmtCOP(lote.separacion)} y la tabla fija ${fmtCOP(SEPARACION_COP)}.`,
    );
  }
  return mensajes;
}

export function codigoCotizacion(nombre: string, fecha: Date, idLote: string): string {
  const partes = nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter(Boolean);
  const persona =
    partes.length > 1 ? `${partes[0]}_${partes[partes.length - 1]}` : partes[0] || "NOMBRE";
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const p = Object.fromEntries(fmt.formatToParts(fecha).map((x) => [x.type, x.value]));
  const lote = idLote.toUpperCase().replace(/[^A-Z0-9]+/g, "-");
  return `CT-${persona}-${p.day}-${p.month}-${p.year}-${lote}`;
}

/** Maps the workbook's Estado text; blanks, 0 or unknown values are "No disponible". */
export function parseEstado(value: unknown): Estado {
  const s = String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (s === "disponible") return "disponible";
  if (s.startsWith("reservad")) return "reservado";
  if (s.includes("negociacion")) return "negociacion";
  if (s.startsWith("vendid")) return "vendido";
  return "no_disponible";
}

export type Lote = {
  id: string; // ET01-A-03
  idLote: string; // A-03
  etapa: string;
  manzana: string;
  lote: string;
  area: number;
  valorLote: number;
  descuento: number; // fraction, 0.05
  valorPreventa: number;
  valorM2: number;
  separacion: number;
  saldoCuotaInicial: number;
  valorFinanciar: number;
  cuota12: number;
  cuota24: number;
  cuota36: number;
  estado: Estado;
};

function isRowObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRowProps(row: unknown): Record<string, unknown> {
  if (!isRowObject(row)) throw new Error("Unexpected Excel row shape.");
  if (
    Object.prototype.hasOwnProperty.call(row, "dynamicProperties") &&
    !isRowObject(row.dynamicProperties)
  ) {
    throw new Error("Unexpected Excel dynamicProperties shape.");
  }
  const nested = isRowObject(row.dynamicProperties) ? row.dynamicProperties : {};
  const out: Record<string, unknown> = {};
  for (const key of COLUMNS) {
    const flat = Object.prototype.hasOwnProperty.call(row, key);
    const wrapped = Object.prototype.hasOwnProperty.call(nested, key);
    if (!flat && !wrapped) throw new Error("Missing confirmed workbook column in Excel row.");
    out[key] = flat ? row[key] : nested[key];
  }
  return out;
}

/** Parses numbers that may arrive as raw numbers or formatted text ("$ 78.000.000", "5%", "0,05"). */
export function parseNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return NaN;
  let s = value.trim();
  if (!s) return NaN;
  // The connector returns raw invariant numbers ("5758333.33333333", "0.074", "1E-3").
  if (/^-?\d+(\.\d+)?(e[+-]?\d+)?$/i.test(s)) return Number(s);
  const percent = s.endsWith("%");
  s = s.replace(/[^\d.,-]/g, "");
  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");
  if (lastDot >= 0 && lastComma >= 0) {
    const dec = lastDot > lastComma ? "." : ",";
    const thou = dec === "." ? "," : ".";
    s = s.split(thou).join("").replace(dec, ".");
  } else if (lastDot >= 0 || lastComma >= 0) {
    const sep = lastDot >= 0 ? "." : ",";
    const parts = s.split(sep);
    const isThousands =
      parts.length > 2 || (parts[1]?.length === 3 && parts[0] !== "0" && parts[0] !== "-0");
    s = isThousands ? parts.join("") : parts.join(".");
  }
  const n = Number(s);
  return percent ? n / 100 : n;
}

function text(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export function toLote(row: unknown): Lote | null {
  const p = getRowProps(row);
  const id = text(p.ID);
  if (!id || id.startsWith("#")) return null;
  const etapaRaw = text(p.Etapa);
  const loteRaw = text(p.Lote);
  return {
    id,
    idLote: text(p.ID_Lote) || id,
    etapa: etapaRaw.length === 1 ? `0${etapaRaw}` : etapaRaw,
    manzana: text(p.Manzana),
    lote: loteRaw.length === 1 ? `0${loteRaw}` : loteRaw,
    area: parseNumber(p.Area_m2),
    valorLote: parseNumber(p.ValorLote),
    descuento: parseNumber(p.DescuentoPreventa),
    valorPreventa: parseNumber(p.ValorPreventa),
    valorM2: parseNumber(p.ValorM2),
    separacion: parseNumber(p.Separacion),
    saldoCuotaInicial: parseNumber(p.SaldoCuotaIinicial),
    valorFinanciar: parseNumber(p.ValorFinanciar),
    cuota12: parseNumber(p.Cuota12),
    cuota24: parseNumber(p.Cuota24),
    cuota36: parseNumber(p.Cuota36),
    estado: parseEstado(p.Estado),
  };
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Lotes (precios + estado del mapa) y fecha de la última actualización de las fuentes. */
export async function fetchLotesYFecha(): Promise<{ lotes: Lote[]; actualizado: Date }> {
  const res = await apiFetch("/api/lotes");
  if (res.status === 401) throw new NoAutorizado(await leerMotivo(res));
  if (!res.ok) throw new ApiError(res.status, "lotes");
  const j = (await res.json()) as { lotes: unknown[]; actualizado: string };
  return {
    lotes: j.lotes.map(toLote).filter((l): l is Lote => l !== null),
    actualizado: new Date(j.actualizado),
  };
}

const fechaHora = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
export const fmtFechaHora = (d: Date) => fechaHora.format(d);

// ---------- formatting ----------
const cop = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const num = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 });

export const fmtCOP = (n: number) => (Number.isFinite(n) ? cop.format(Math.round(n)) : "—");
export const fmtNum = (n: number) => (Number.isFinite(n) ? num.format(n) : "—");
export const fmtPct = (n: number) => (Number.isFinite(n) ? `${num.format(n * 100)}%` : "—");

const ROMAN: [number, string][] = [
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];
export function etapaRomana(etapa: string): string {
  let n = parseInt(etapa, 10);
  if (!Number.isFinite(n) || n <= 0) return etapa;
  let out = "";
  for (const [v, r] of ROMAN)
    while (n >= v) {
      out += r;
      n -= v;
    }
  return out;
}

// ---------- validation ----------
export const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
export const cleanCC = (s: string) => s.replace(/[\s.]/g, "");
export const isValidCC = (s: string) => /^\d{5,11}$/.test(cleanCC(s));

// ---------- error classification (no raw upstream text is shown) ----------
function findStatus(e: unknown, depth = 0): number | undefined {
  if (depth > 3 || typeof e !== "object" || e === null) return undefined;
  const o = e as Record<string, unknown>;
  for (const k of ["status", "statusCode", "httpStatusCode", "httpStatus"]) {
    const v = o[k];
    const n = typeof v === "number" ? v : typeof v === "string" ? parseInt(v, 10) : NaN;
    if (Number.isInteger(n) && n >= 100 && n < 600) return n;
  }
  for (const k of ["error", "cause", "innerError", "data"]) {
    const n = findStatus(o[k], depth + 1);
    if (n) return n;
  }
  return undefined;
}

function textOf(e: unknown): string {
  try {
    return (
      e instanceof Error ? `${e.name} ${e.message}` : (JSON.stringify(e) ?? "")
    ).toLowerCase();
  } catch {
    return "";
  }
}

export type ErrorInfo = { titulo: string; detalle: string; codigo?: number };

export function describirError(e: unknown): ErrorInfo {
  const codigo = e instanceof ApiError ? e.status : findStatus(e);
  const t = textOf(e);
  if (t.includes("credit") || t.includes("crédito") || codigo === 402) {
    return {
      codigo,
      titulo: "Tu cuenta aún no tiene habilitado el uso de la app",
      detalle:
        "Falta la licencia o los créditos para consultar datos. Cuando el aviso de créditos desaparezca, vuelve a intentar.",
    };
  }
  if (
    codigo === 401 ||
    codigo === 403 ||
    t.includes("forbidden") ||
    t.includes("access denied") ||
    t.includes("unauthorized")
  ) {
    return {
      codigo,
      titulo: "Sin permiso para leer el Excel de precios",
      detalle:
        "Tu cuenta no tiene acceso al archivo de precios. Pide al administrador que te lo comparta.",
    };
  }
  if (codigo === 404 || t.includes("not found")) {
    return {
      codigo,
      titulo: "No se encontró el Excel de precios",
      detalle: "El archivo o su tabla de precios cambió de lugar o de nombre.",
    };
  }
  if (codigo === 429 || t.includes("throttl")) {
    return {
      codigo,
      titulo: "Demasiadas consultas en este momento",
      detalle: "Espera un minuto y vuelve a intentar.",
    };
  }
  if (codigo === 502 || codigo === 503 || codigo === 504) {
    return {
      codigo,
      titulo: "El Excel de precios no respondió",
      detalle: "Puede estar bloqueado o en edición. Intenta de nuevo en unos segundos.",
    };
  }
  return {
    codigo,
    titulo: "No se pudieron cargar los lotes",
    detalle: "Ocurrió un problema al leer el Excel de precios. Intenta de nuevo.",
  };
}
