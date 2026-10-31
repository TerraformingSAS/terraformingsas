import assert from "node:assert/strict";
import { test } from "node:test";
import {
  PARAMETROS_DEFAULT,
  PARAMETROS_SEED,
  esAdminRol,
  itemsDesdeParametros,
  parametrosDesdeItems,
} from "./parametros.ts";

test("esAdminRol reconoce Administrador sin importar mayúsculas", () => {
  assert.equal(esAdminRol("Administrador"), true);
  assert.equal(esAdminRol(" administrador "), true);
  assert.equal(esAdminRol("Vendedor"), false);
  assert.equal(esAdminRol(""), false);
});

test("parametrosDesdeItems aplica overrides y mantiene defaults", () => {
  const p = parametrosDesdeItems([
    { clave: "vigencia_dias", valor: "9" },
    { clave: "msg_no_reserva", valor: "Texto custom" },
  ]);
  assert.equal(p.vigenciaDias, 9);
  assert.equal(p.msgNoReserva, "Texto custom");
  assert.equal(p.separacionCop, PARAMETROS_DEFAULT.separacionCop);
});

test("itemsDesdeParametros cubre todas las claves seed", () => {
  const items = itemsDesdeParametros(PARAMETROS_DEFAULT);
  assert.equal(items.length, PARAMETROS_SEED.length);
  assert.deepEqual(
    items.map((i) => i.clave).sort(),
    PARAMETROS_SEED.map((i) => i.clave).sort(),
  );
});
