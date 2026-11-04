import type { JoinedLot } from "./join";

type TerrainFrame = {
  perimetro: [number, number][];
};

export type PlacedLot = {
  id: string;
  anillo: [number, number][];
};

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
 * El loteo es la franja del plano junto a la vía, al oriente del predio.
 * El lado largo del plano (615 m) queda hacia el sur y entra completo en el perímetro.
 */
export function colocarLotes(terrain: TerrainFrame, lots: JoinedLot[]): PlacedLot[] {
  if (lots.length === 0 || terrain.perimetro.length === 0) return [];
  return lots.map((lot) => ({
    id: lot.id,
    anillo: lot.puntos.map(([x, y]) => {
      const along = (x - LOCAL_X_MIN) * SCALE;
      const across = (y - LOCAL_Y_MID) * SCALE;
      return [
        NORTH_END[0] + ALONG[0] * along + ACROSS[0] * across,
        NORTH_END[1] + ALONG[1] * along + ACROSS[1] * across,
      ] as [number, number];
    }),
  }));
}
