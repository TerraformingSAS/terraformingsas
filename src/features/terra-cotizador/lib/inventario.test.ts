import assert from "node:assert/strict";
import test from "node:test";
import {
  areaRegistrada,
  contarEstados,
  filtrarLotes,
  inventarioPorManzana,
} from "./inventario.ts";
import type { Lote } from "./lotes.ts";

function lote(partial: Pick<Lote, "idLote" | "manzana" | "estado" | "area">): Lote {
  return {
    id: `ET01-${partial.idLote}`,
    etapa: "01",
    lote: partial.idLote.split("-")[1] ?? "01",
    valorLote: 0,
    descuento: 0,
    valorPreventa: 0,
    valorM2: 0,
    separacion: 0,
    saldoCuotaInicial: 0,
    valorFinanciar: 0,
    cuota12: 0,
    cuota24: 0,
    cuota36: 0,
    ...partial,
  };
}

const lotes = [
  lote({ idLote: "A-01", manzana: "A", estado: "no_disponible", area: 120 }),
  lote({ idLote: "A-02", manzana: "A", estado: "no_disponible", area: 154 }),
  lote({ idLote: "C-01", manzana: "C", estado: "disponible", area: 165.5 }),
  lote({ idLote: "C-02", manzana: "C", estado: "reservado", area: 211.75 }),
  lote({ idLote: "E-01", manzana: "E", estado: "vendido", area: 120 }),
  lote({ idLote: "D-01", manzana: "D", estado: "negociacion", area: 154 }),
];

test("filtra por manzana, estado y texto de ubicación", () => {
  assert.equal(filtrarLotes(lotes, { manzana: "C", estado: "", q: "" }).length, 2);
  assert.equal(filtrarLotes(lotes, { manzana: "", estado: "vendido", q: "" }).length, 1);
  assert.deepEqual(
    filtrarLotes(lotes, { manzana: "", estado: "", q: "a-02" }).map((l) => l.idLote),
    ["A-02"],
  );
});

test("cuenta estados y área con los lotes filtrados", () => {
  const c = contarEstados(lotes);
  assert.equal(c.disponible, 1);
  assert.equal(c.no_disponible, 2);
  assert.equal(c.reservado, 1);
  assert.equal(c.negociacion, 1);
  assert.equal(c.vendido, 1);
  assert.equal(areaRegistrada(lotes), 120 + 154 + 165.5 + 211.75 + 120 + 154);
});

test("apila el inventario por manzana", () => {
  const filas = inventarioPorManzana(lotes);
  assert.deepEqual(
    filas.map((f) => f.manzana),
    ["A", "C", "D", "E"],
  );
  assert.equal(filas[0].no_disponible, 2);
  assert.equal(filas[1].disponible, 1);
  assert.equal(filas[1].reservado, 1);
});
