import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { joinLots, type GeomLot } from "./join.ts";

test("la geometría del mapa es la misma del visor /terra/estado", () => {
  const published = fs.readFileSync(
    new URL("../../../server/terra/lib/geometria.json", import.meta.url),
    "utf8",
  );
  const mapCopy = fs.readFileSync(new URL("./geometria.json", import.meta.url), "utf8");
  assert.equal(mapCopy, published);
});

const geometry: GeomLot[] = [
  {
    id: "C-08",
    manzana: "C",
    lote: "08",
    puntos: [
      [0, 0],
      [10, 0],
      [10, 8],
      [0, 8],
    ],
    centro: [5, 4],
  },
];

test("asocia geometría y estado por id sin copiar el estado al plano", () => {
  const joined = joinLots(geometry, [
    {
      id: "C-08",
      manzana: "C",
      lote: "08",
      estado: "Disponible",
      medidas: { lado_a_m: 10, lado_b_m: 12, area_m2: 120 },
    },
    { id: "Z-01", manzana: "Z", lote: "01", estado: "Vendido" },
  ]);
  assert.equal(joined.lots[0]?.estado, "Disponible");
  assert.equal(joined.lots[0]?.medidas?.area_m2, 120);
  assert.deepEqual(joined.sinComercial, []);
  assert.deepEqual(joined.sinGeometria, ["Z-01"]);
});

test("no inventa estado cuando el id no está en la fuente comercial", () => {
  const joined = joinLots(geometry, []);
  assert.equal(joined.lots[0]?.estado, null);
  assert.deepEqual(joined.sinComercial, ["C-08"]);
});
