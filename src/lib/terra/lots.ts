export const LOT_STATES = [
  "Disponible",
  "Reservado",
  "En negociación",
  "Vendido",
  "No disponible",
] as const;

export type LotState = (typeof LOT_STATES)[number];

export type PublicLotMeasures = {
  lado_a_m: number;
  lado_b_m: number;
  area_m2: number;
  fuente?: string;
};

export type PublicLot = {
  id: string;
  manzana: string;
  lote: string;
  estado: string;
  medidas?: PublicLotMeasures | null;
};

export type TerraEstadoPayload = {
  actualizado?: string;
  consultado?: string;
  lotes: PublicLot[];
};

export function normalizeLotId(raw: string): string {
  const query = raw.trim().toUpperCase().replace(/\s/g, "");
  return query.replace(/^([A-F])-?(\d)$/, "$1-0$2");
}

export function findPublicLot(lotes: PublicLot[], raw: string): PublicLot | undefined {
  const id = normalizeLotId(raw);
  if (!id) return undefined;
  return lotes.find((lot) => lot.id === id || `${lot.manzana}-${lot.lote}` === id);
}

export function isAvailableLot(estado: string): boolean {
  return estado === "Disponible";
}

export type LotStatusGroup = "disponibles" | "separados" | "no_disponibles";

export function groupLotStatus(estado: string): LotStatusGroup {
  if (estado === "Disponible") return "disponibles";
  if (estado === "Reservado" || estado === "En negociación") return "separados";
  return "no_disponibles";
}

export function summarizeLots(lotes: PublicLot[]) {
  const summary = { total: lotes.length, disponibles: 0, separados: 0, no_disponibles: 0 };
  for (const lot of lotes) {
    summary[groupLotStatus(lot.estado)] += 1;
  }
  return summary;
}

export function lotExplorerUrl(lotId?: string): string {
  if (!lotId) return "/terra/estado";
  return `/terra/estado?lote=${encodeURIComponent(normalizeLotId(lotId))}`;
}

export function lotQuoteUrl(lotId?: string): string {
  if (!lotId) return "/terra#contacto";
  return `/terra?lote=${encodeURIComponent(normalizeLotId(lotId))}#contacto`;
}

export async function fetchPublicLots(signal?: AbortSignal): Promise<TerraEstadoPayload> {
  const response = await fetch("/api/terra-estado", { cache: "no-store", signal });
  if (!response.ok) throw new Error("No se pudo consultar la disponibilidad.");
  const data = (await response.json()) as TerraEstadoPayload;
  if (!Array.isArray(data?.lotes))
    throw new Error("La disponibilidad no tiene el formato esperado.");
  return data;
}

export function formatArea(area: number | undefined | null): string {
  if (area == null || Number.isNaN(area)) return "Por confirmar";
  return `${Number(area).toLocaleString("es-CO", { maximumFractionDigits: 2 })} m²`;
}
