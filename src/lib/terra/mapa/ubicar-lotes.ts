import type { JoinedLot } from "./join";

type TerrainFrame = {
  perimetro: [number, number][];
};

export type PlacedLot = {
  id: string;
  anillo: [number, number][];
};

const ETAPA_I = new Set(["C", "D", "E", "F"]);

/**
 * Esquina norte del loteo, en metros del terreno.
 * Quedó recalculada al girar 10° para que el centro del bloque no se mueva.
 */
const NORTH_END: [number, number] = [1250.152, 1038.5198];
/** Eje corto, girado 10° en sentido horario. */
const ACROSS: [number, number] = [0.99651353, -0.0834201];
/** Eje largo, girado 10° en sentido horario. */
const ALONG: [number, number] = [-0.26243845, -0.96494777];
const SCALE = 0.92;
const LOCAL_X_MIN = -295.191539;
const LOCAL_Y_MID = (-39.676557 + 96.390132) / 2;

/**
 * La etapa I son las manzanas C, D, E y F.
 * El bloque gira 10° en sentido horario alrededor de su centro, sin desplazarse.
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
