import type { JoinedLot } from "./join";

type TerrainFrame = {
  perimetro: [number, number][];
};

export type PlacedLot = {
  id: string;
  anillo: [number, number][];
};

const ETAPA_I = new Set(["C", "D", "E", "F"]);

/** Esquina norte del loteo, en metros del terreno: este y norte. */
const NORTH_END: [number, number] = [1192.85, 1044.59];
/** Eje corto, a lo largo de la vía, hacia el oriente. */
const ACROSS: [number, number] = [0.99586, 0.09089];
/** Eje largo, desde la vía hacia el sur. */
const ALONG: [number, number] = [-0.09089, -0.99586];
const SCALE = 0.92;
const LOCAL_X_MIN = -295.191539;
const LOCAL_Y_MID = (-39.676557 + 96.390132) / 2;

/**
 * La etapa I son las manzanas C, D, E y F.
 * Conservan el sitio de la franja junto a la vía, con el lado largo hacia el sur.
 * El eje corto va invertido para no dejar el plano en espejo.
 */
export function colocarLotes(terrain: TerrainFrame, lots: JoinedLot[]): PlacedLot[] {
  if (lots.length === 0 || terrain.perimetro.length === 0) return [];
  return lots
    .filter((lot) => ETAPA_I.has(lot.manzana))
    .map((lot) => ({
      id: lot.id,
      anillo: lot.puntos.map(([x, y]) => {
        const along = (x - LOCAL_X_MIN) * SCALE;
        const across = (LOCAL_Y_MID - y) * SCALE;
        return [
          NORTH_END[0] + ALONG[0] * along + ACROSS[0] * across,
          NORTH_END[1] + ALONG[1] * along + ACROSS[1] * across,
        ] as [number, number];
      }),
    }));
}
