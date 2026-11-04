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
const NORTH_END: [number, number] = [1254.4822, 1009.7946];
/** Eje corto, paralelo a la vía y hacia el interior. */
const ACROSS: [number, number] = [0.98264784, -0.18547599];
/** Eje largo, paralelo a la vía y hacia el sur. */
const ALONG: [number, number] = [-0.3602981, -0.93283622];
const SCALE = 0.874;
const LOCAL_X_MIN = -295.191539;
const LOCAL_Y_MID = (-39.676557 + 96.390132) / 2;

/**
 * La etapa I son las manzanas C, D, E y F.
 * El bloque conserva su tamaño y queda paralelo a la vía, sobre su costado izquierdo.
 * El eje corto va invertido para no dejar el plano en espejo.
 */
/** Lleva un punto del plano local al terreno, con la misma base que los lotes. */
export function ubicarPunto(x: number, y: number): [number, number] {
  const along = (x - LOCAL_X_MIN) * SCALE;
  const across = (LOCAL_Y_MID - y) * SCALE;
  return [
    NORTH_END[0] + ALONG[0] * along + ACROSS[0] * across,
    NORTH_END[1] + ALONG[1] * along + ACROSS[1] * across,
  ];
}

export function colocarLotes(terrain: TerrainFrame, lots: JoinedLot[]): PlacedLot[] {
  if (lots.length === 0 || terrain.perimetro.length === 0) return [];
  return lots
    .filter((lot) => ETAPA_I.has(lot.manzana))
    .map((lot) => ({
      id: lot.id,
      anillo: lot.puntos.map(([x, y]) => {
        return ubicarPunto(x, y);
      }),
    }));
}
