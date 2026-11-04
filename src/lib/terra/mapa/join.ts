import type { PublicLot } from "../lots";

export type GeomLot = {
  id: string;
  manzana: string;
  lote: string;
  puntos: [number, number][];
  centro: [number, number];
};

export type JoinedLot = GeomLot & {
  estado: string | null;
  medidas: PublicLot["medidas"];
  matched: boolean;
};

export function joinLots(geometry: GeomLot[], commercial: PublicLot[]) {
  const byId = new Map(commercial.map((lot) => [lot.id, lot]));
  const geometryIds = new Set(geometry.map((lot) => lot.id));
  const lots: JoinedLot[] = geometry.map((lot) => {
    const commercialLot = byId.get(lot.id);
    return {
      ...lot,
      estado: commercialLot?.estado ?? null,
      medidas: commercialLot?.medidas ?? null,
      matched: Boolean(commercialLot),
    };
  });
  return {
    lots,
    sinGeometria: commercial.filter((lot) => !geometryIds.has(lot.id)).map((lot) => lot.id),
    sinComercial: lots.filter((lot) => !lot.matched).map((lot) => lot.id),
  };
}
