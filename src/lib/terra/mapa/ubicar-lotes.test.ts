import assert from "node:assert/strict";
import test from "node:test";
import anclaje from "./anclaje-lotes.json" with { type: "json" };
import type { JoinedLot } from "./join.ts";
import { colocarLotes } from "./ubicar-lotes.ts";

const lot: JoinedLot = {
  id: "C-01",
  manzana: "C",
  lote: "01",
  puntos: [
    [-61.3, 61.25],
    [-51.3, 61.25],
    [-51.3, 71.25],
    [-61.3, 71.25],
  ],
  centro: [-56.3, 66.25],
  estado: "Disponible",
  medidas: { lado_a_m: 10, lado_b_m: 10, area_m2: 100 },
  matched: true,
};

test("la manzana C cae sobre el ancla del plano, no en el centro arbitrario", () => {
  const perimetro: [number, number][] = [
    [0, 0],
    [1000, 0],
    [1000, 800],
    [0, 800],
  ];
  const placed = colocarLotes({ perimetro }, [lot]);
  const ring = placed[0]?.anillo ?? [];
  const cx = ring.reduce((sum, point) => sum + point[0], 0) / ring.length;
  const cz = ring.reduce((sum, point) => sum + point[1], 0) / ring.length;
  const [destX, destZ] = anclaje.manzanas.C.destino;
  assert.ok(Math.abs(cx - (500 + destX)) < 8);
  assert.ok(Math.abs(cz - (400 + destZ)) < 8);
});
