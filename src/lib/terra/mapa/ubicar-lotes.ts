import anclaje from "./anclaje-lotes.json" with { type: "json" };
import type { JoinedLot } from "./join";

type TerrainFrame = {
  perimetro: [number, number][];
};

export type PlacedLot = {
  id: string;
  anillo: [number, number][];
};

const ROTATION = anclaje.rotation;
const SCALE = anclaje.scale;

function centroid(points: [number, number][]) {
  let x = 0;
  let y = 0;
  for (const point of points) {
    x += point[0];
    y += point[1];
  }
  return [x / points.length, y / points.length] as const;
}

/**
 * Cada manzana se apoya en los textos del DWG (C, D, E y F), trasladados al
 * perímetro del KML. A y B no tienen rótulo en ese plano: conservan la misma
 * rotación y su distancia a C.
 */
export function colocarLotes(terrain: TerrainFrame, lots: JoinedLot[]): PlacedLot[] {
  if (lots.length === 0 || terrain.perimetro.length === 0) return [];
  const [anchorX, anchorZ] = centroid(terrain.perimetro);
  return lots.map((lot) => {
    const block = anclaje.manzanas[lot.manzana as keyof typeof anclaje.manzanas];
    const [lx, ly] = block.centroLocal;
    const [dx, dy] = block.destino;
    const anillo = lot.puntos.map(([x, y]) => {
      const vx = x - lx;
      const vy = y - ly;
      const east = SCALE * (ROTATION[0][0] * vx + ROTATION[0][1] * vy) + dx;
      const north = SCALE * (ROTATION[1][0] * vx + ROTATION[1][1] * vy) + dy;
      return [anchorX + east, anchorZ + north] as [number, number];
    });
    return { id: lot.id, anillo };
  });
}
