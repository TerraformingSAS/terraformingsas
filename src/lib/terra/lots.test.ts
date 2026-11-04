import assert from "node:assert/strict";
import { test } from "node:test";
import {
  findPublicLot,
  formatArea,
  groupLotStatus,
  lotExplorerUrl,
  normalizeLotId,
  summarizeLots,
} from "./lots.ts";

test("normaliza nomenclatura de lote", () => {
  assert.equal(normalizeLotId("c-4"), "C-04");
  assert.equal(normalizeLotId("C12"), "C12");
  assert.equal(normalizeLotId("  e-03 "), "E-03");
});

test("agrupa estados sin alterar la fuente", () => {
  assert.equal(groupLotStatus("Disponible"), "disponibles");
  assert.equal(groupLotStatus("Reservado"), "separados");
  assert.equal(groupLotStatus("En negociación"), "separados");
  assert.equal(groupLotStatus("No disponible"), "no_disponibles");
  assert.equal(groupLotStatus("Vendido"), "no_disponibles");
});

test("resume lotes reales y arma el enlace del visor", () => {
  const lotes = [
    { id: "C-01", manzana: "C", lote: "01", estado: "Disponible" },
    { id: "C-02", manzana: "C", lote: "02", estado: "Reservado" },
    { id: "A-01", manzana: "A", lote: "01", estado: "No disponible" },
  ];
  assert.deepEqual(summarizeLots(lotes), {
    total: 3,
    disponibles: 1,
    separados: 1,
    no_disponibles: 1,
  });
  assert.equal(findPublicLot(lotes, "c-1")?.id, "C-01");
  assert.equal(lotExplorerUrl("c-1"), "/terra/estado?lote=C-01");
  assert.equal(formatArea(211.75), "211,75 m²");
});
