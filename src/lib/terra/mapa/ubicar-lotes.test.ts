import assert from "node:assert/strict";
import test from "node:test";
import type { JoinedLot } from "./join.ts";
import { colocarLotes } from "./ubicar-lotes.ts";

function lot(id: string, manzana: string, x: number, y: number): JoinedLot {
  return {
    id,
    manzana,
    lote: "01",
    puntos: [
      [x, y],
      [x + 4, y],
      [x + 4, y + 4],
      [x, y + 4],
    ],
    centro: [x + 2, y + 2],
    estado: "Disponible",
    medidas: null,
    matched: true,
  };
}

test("la etapa I solo ubica C, D, E y F, con C al norte de F", () => {
  const placed = colocarLotes({ perimetro: [[0, 0], [1, 0], [1, 1]] }, [
    lot("A-01", "A", -200, 0),
    lot("C-01", "C", -102.074062, 28),
    lot("F-01", "F", 300, 28),
  ]);
  assert.deepEqual(placed.map((item) => item.id), ["C-01", "F-01"]);
  const north = placed[0]?.anillo[0]?.[1] ?? 0;
  const south = placed[1]?.anillo[0]?.[1] ?? 0;
  assert.ok(south < north - 200);
});
