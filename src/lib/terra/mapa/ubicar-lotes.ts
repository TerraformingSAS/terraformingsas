import type { JoinedLot } from "./join";

type TerrainFrame = {
  perimetro: [number, number][];
};

export type PlacedLot = {
  id: string;
  anillo: [number, number][];
};

const ETAPA_I = new Set(["C", "D", "E", "F"]);

/** Extremo norte de la etapa, junto a la vía, en metros del terreno. */
const NORTH_END: [number, number] = [1267.5, 1026.5];
/** Del norte hacia el sur, siguiendo el costado de la quebrada. */
const ALONG: [number, number] = [-0.5255, -0.8508];
/** A través de la franja. El signo evita el espejo del plano. */
const ACROSS: [number, number] = [-0.8508, 0.5255];
const SCALE = 0.85;
const LOCAL_X_MIN = -102.074062;
const LOCAL_Y_MID = (-39.676557 + 96.229503) / 2;

/**
 * Etapa I son las manzanas C, D, E y F.
 * Quedan en la franja suroriental del predio, como en el plano sobre la foto.
 */
export function colocarLotes(terrain: TerrainFrame, lots: JoinedLot[]): PlacedLot[] {
  if (lots.length === 0 || terrain.perimetro.length === 0) return [];
  return lots
    .filter((lot) => ETAPA_I.has(lot.manzana))
    .map((lot) => ({
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
