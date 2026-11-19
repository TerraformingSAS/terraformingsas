import assert from "node:assert/strict";
import { test } from "node:test";
import { isQuoteBlocked, quoteStatusNote } from "./quote-status.ts";

test("un lote vendido o no disponible no se cotiza", () => {
  assert.equal(isQuoteBlocked("Vendido"), true);
  assert.equal(isQuoteBlocked("vendido"), true);
  assert.equal(isQuoteBlocked("No disponible"), true);
  assert.equal(isQuoteBlocked("Disponible"), false);
  assert.equal(isQuoteBlocked("Reservado"), false);
  assert.equal(isQuoteBlocked("En negociación"), false);
});

test("reservado y en negociación muestran aviso y sí se pueden cotizar", () => {
  assert.match(quoteStatusNote("Reservado"), /reservado/i);
  assert.match(quoteStatusNote("En negociación"), /negociación/i);
  assert.equal(quoteStatusNote("Disponible"), "");
});
