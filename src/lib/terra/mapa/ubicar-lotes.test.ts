import assert from "node:assert/strict";
import test from "node:test";
import type { JoinedLot } from "./join.ts";
import { colocarLotes, escalaMetros } from "./ubicar-lotes.ts";

const lot: JoinedLot = {
  id: "C-01",
  manzana: "C",
  lote: "01",
  puntos: [
    [0, 0],
    [20, 0],
    [20, 10],
    [0, 10],
  ],
  centro: [10, 5],
  estado: "Disponible",
  medidas: { lado_a_m: 10, lado_b_m: 12, area_m2: 50 },
  matched: true,
};

test("la escala convierte el área dibujada al área comercial", () => {
  const scale = escalaMetros([lot]);
  assert.ok(Math.abs(scale - Math.sqrt(50 / 200)) < 1e-9);
});

test("el lote queda centrado en el perímetro del predio", () => {
  const placed = colocarLotes(
    {
      widthM: 1000,
      depthM: 800,
      perimetro: [
        [100, 100],
        [900, 100],
        [900, 700],
        [100, 700],
      ],
    },
    [lot],
  );
  const ring = placed[0]?.anillo ?? [];
  const cx = ring.reduce((sum, point) => sum + point[0], 0) / ring.length;
  const cz = ring.reduce((sum, point) => sum + point[1], 0) / ring.length;
  assert.ok(Math.abs(cx - 500) < 1e-6);
  assert.ok(Math.abs(cz - 400) < 1e-6);
});
