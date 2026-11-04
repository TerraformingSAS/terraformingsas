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
 * Quedó recalculada al girar 12° y correr el bloque 36 m al occidente.
 */
const NORTH_END: [number, number] = [1221.7052, 1020.0096];
/** Eje corto, girado 12° en sentido horario. */
const ACROSS: [number, number] = [0.99299516, -0.1181471];
/** Eje largo, girado 12° en sentido horario. */
const ALONG: [number, number] = [-0.29595477, -0.95520098];
const SCALE = 0.874;
const LOCAL_X_MIN = -295.191539;
const LOCAL_Y_MID = (-39.676557 + 96.390132) / 2;

/**
 * La etapa I son las manzanas C, D, E y F.
 * El bloque gira 12° en sentido horario, queda 36 m al occidente y es 5% más pequeño, sin mover su centro.
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
