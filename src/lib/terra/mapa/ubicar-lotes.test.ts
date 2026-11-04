import assert from "node:assert/strict";
import test from "node:test";
import type { JoinedLot } from "./join.ts";
import { colocarLotes } from "./ubicar-lotes.ts";

function lot(id: string, x: number, y: number): JoinedLot {
  return {
    id,
    manzana: id[0] ?? "A",
    lote: "01",
    puntos: [
      [x, y],
      [x + 10, y],
      [x + 10, y + 8],
      [x, y + 8],
    ],
    centro: [x + 5, y + 4],
    estado: "Disponible",
    medidas: null,
    matched: true,
  };
}

test("el extremo norte del plano queda junto a la vía y el lado largo baja al sur", () => {
  const placed = colocarLotes(
    {
      perimetro: [
        [0, 0],
        [1, 0],
        [1, 1],
      ],
    },
    [lot("A-01", -295.191539, 28), lot("F-01", 300, 28)],
  );
  const north = placed[0]?.anillo[0];
  const south = placed[1]?.anillo[0];
  assert.ok(north);
  assert.ok(south);
  assert.ok(Math.abs(north[0] - 1192.85) < 2);
  assert.ok(south[1] < north[1] - 400);
});
