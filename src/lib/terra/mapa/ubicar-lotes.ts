import type { JoinedLot } from "./join";

type TerrainFrame = {
  widthM: number;
  depthM: number;
  perimetro: [number, number][];
};

export type PlacedLot = {
  id: string;
  anillo: [number, number][];
  escala: number;
};

function shoelace(points: [number, number][]) {
  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const next = points[(i + 1) % points.length];
    area += points[i][0] * next[1] - next[0] * points[i][1];
  }
  return Math.abs(area) / 2;
}

function centroid(points: [number, number][]) {
  let x = 0;
  let y = 0;
  for (const point of points) {
    x += point[0];
    y += point[1];
  }
  return [x / points.length, y / points.length] as const;
}

/** Escala lineal para que el área del polígono se acerque al área comercial en m². */
export function escalaMetros(lots: JoinedLot[]) {
  const ratios: number[] = [];
  for (const lot of lots) {
    const area = lot.medidas?.area_m2;
    const drawn = shoelace(lot.puntos);
    if (area == null || area <= 0 || drawn <= 0) continue;
    ratios.push(Math.sqrt(area / drawn));
  }
  if (ratios.length === 0) return 1;
  ratios.sort((a, b) => a - b);
  return ratios[Math.floor(ratios.length / 2)];
}

/**
 * Lleva el plano local al predio del KML.
 * El tamaño sale del área comercial. El ancla es el centro del perímetro:
 * no hay mojones que fijen el desplazamiento ni el giro.
 */
export function colocarLotes(terrain: TerrainFrame, lots: JoinedLot[]): PlacedLot[] {
  if (lots.length === 0 || terrain.perimetro.length === 0) return [];
  const scale = escalaMetros(lots);
  const [anchorX, anchorZ] = centroid(terrain.perimetro);
  const flat = lots.flatMap((lot) => lot.puntos);
  const [originX, originY] = centroid(flat);
  return lots.map((lot) => ({
    id: lot.id,
    escala: scale,
    anillo: lot.puntos.map(([x, y]) => [
      anchorX + (x - originX) * scale,
      anchorZ + (y - originY) * scale,
    ]),
  }));
}
