import assert from "node:assert/strict";
import { test } from "node:test";
import { crearHandlersDinamicos, type DependenciasDinamicas } from "./handlers.ts";
import { PARAMETROS_DINAMICOS as P } from "../../../features/terra-cotizador-dinamico/lib/parametros.ts";
import type { CotizacionDinamica } from "../../../features/terra-cotizador-dinamico/lib/types.ts";

const condiciones = {
  separacion: 5_000_000,
  porcentaje: 100,
  cuotaMensual: 1_000_000,
  periodos: 24,
  fechaSeparacion: "2026-11-30",
  fechaEntrega: "2028-11-30",
  interesesHastaEntrega: true,
  abonos: [],
};
const body = {
  loteId: "ET01-E-02",
  valorPreventa: 126_626_500,
  parametros: P,
  cliente: { nombre: "Cliente de prueba", cc: "123456789", email: "", referido: "" },
  condiciones,
};
const req = (method: string, payload?: unknown, query = "") =>
  new Request(`http://localhost/api/cotizador-dinamico/cotizaciones${query}`, {
    method,
    ...(payload !== undefined
      ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      : {}),
  });

function setup(overrides: Partial<DependenciasDinamicas> = {}) {
  const stored = new Map<string, CotizacionDinamica>();
  let sends = 0,
    configWrites = 0;
  const d: DependenciasDinamicas = {
    sesion: async () => ({
      ok: true,
      sesion: { email: "asesor@example.com", nombre: "Asesor", rol: "Vendedor" },
    }),
    noAutorizado: () => Response.json({ ok: false }, { status: 401 }),
    leerParametros: async () => ({ ...P }),
    guardarParametros: async () => {
      configWrites++;
    },
    lote: async () => ({
      lote: {
        id: "ET01-E-02",
        idLote: "E-02",
        area: 211.75,
        valorPreventa: 126_626_500,
        estado: "disponible",
      },
      comercial: {
        vigenciaDias: 5,
        msgNoReserva: "No reserva",
        empresaNombre: "TERRA",
        nit: "1",
        banco: "Banco",
        cuenta: "123",
        emailMercadeo: "mercadeo@example.com",
        telefono: "123",
        direccion: "Cali",
      },
      errores: [],
    }),
    guardar: async (c) => {
      stored.set(c.id, structuredClone(c));
    },
    leer: async (id) => stored.get(id) ?? null,
    enviar: async () => {
      sends++;
    },
    id: () => "12345678-1234-1234-1234-123456789abc",
    ahora: () => "2026-11-14T12:00:00Z",
    ...overrides,
  };
  return {
    h: crearHandlersDinamicos(d),
    stored,
    d,
    writes: () => configWrites,
    sends: () => sends,
  };
}

test("todas las rutas exigen sesión; vendedor no puede modificar parámetros", async () => {
  const denied = setup({ sesion: async () => ({ ok: false, motivo: "vencida" }) });
  assert.equal((await denied.h.parametros(req("GET"))).status, 401);
  assert.equal((await denied.h.cotizaciones(req("POST", body))).status, 401);
  assert.equal((await denied.h.enviar(req("POST", { id: "abc" }))).status, 401);
  const vendedor = setup();
  assert.equal((await vendedor.h.parametros(req("PUT", P))).status, 403);
  assert.equal(vendedor.writes(), 0);
});

test("administrador guarda solo parámetros válidos", async () => {
  const t = setup({
    sesion: async () => ({
      ok: true,
      sesion: { email: "admin@example.com", nombre: "Admin", rol: "Administrador" },
    }),
  });
  assert.equal((await t.h.parametros(req("PUT", { ...P, tasaMensual: -1 }))).status, 400);
  assert.equal(t.writes(), 0);
  assert.equal((await t.h.parametros(req("PUT", { ...P, periodos: 18 }))).status, 200);
  assert.equal(t.writes(), 1);
});

test("recalcula en servidor; ignora saldos y vendedor enviados por el cliente", async () => {
  const t = setup();
  const response = await t.h.cotizaciones(
    req("POST", { ...body, plan: { pagoFinal: 0 }, vendedor: { email: "otro@example.com" } }),
  );
  assert.equal(response.status, 201);
  const { cotizacion: c } = await response.json();
  assert.equal(Math.round(c.plan.pagoFinal), 127_459_916);
  assert.equal(c.vendedor.email, "asesor@example.com");
  assert.equal(t.stored.size, 1);
  assert.equal(t.sends(), 0);
});

test("admite 18 meses y varios abonos, sin restricciones del cotizador fijo", async () => {
  const t = setup();
  const response = await t.h.cotizaciones(
    req("POST", {
      ...body,
      condiciones: {
        ...condiciones,
        periodos: 18,
        fechaEntrega: "2028-05-31",
        abonos: [
          { id: "a", periodo: 6, valor: 100_000, concepto: "Prima" },
          { id: "b", periodo: 6, valor: 200_000, concepto: "Ahorro" },
        ],
      },
    }),
  );
  assert.equal(response.status, 201);
  const { cotizacion: c } = await response.json();
  assert.equal(c.plan.filas.length, 18);
  assert.equal(c.plan.totalAbonos, 300_000);
});

test("rechaza precio manipulado, cambio de parámetros, lote no disponible y comprador inválido", async () => {
  const t = setup();
  assert.equal((await t.h.cotizaciones(req("POST", { ...body, valorPreventa: 1 }))).status, 409);
  assert.equal(
    (await t.h.cotizaciones(req("POST", { ...body, parametros: { ...P, tasaMensual: 0 } }))).status,
    409,
  );
  assert.equal(
    (await t.h.cotizaciones(req("POST", { ...body, cliente: { ...body.cliente, cc: "" } }))).status,
    400,
  );
  const unavailable = setup({ lote: async () => null });
  assert.equal((await unavailable.h.cotizaciones(req("POST", body))).status, 409);
  assert.equal(t.stored.size, 0);
});

test("snapshot conserva tasa y plan al cambiar parámetros; lectura y envío restringidos al propietario/admin", async () => {
  const t = setup();
  const { cotizacion: c } = await (await t.h.cotizaciones(req("POST", body))).json();
  const changed = crearHandlersDinamicos({
    ...t.d,
    leerParametros: async () => ({ ...P, tasaMensual: 0.02 }),
  });
  const saved = await (await changed.cotizaciones(req("GET", undefined, `?id=${c.id}`))).json();
  assert.equal(saved.cotizacion.plan.tasaMensual, 0.01);
  assert.equal(saved.cotizacion.plan.pagoFinal, c.plan.pagoFinal);
  assert.equal((await changed.enviar(req("POST", { id: c.id }))).status, 200);
  assert.equal(t.sends(), 1);
  const other = crearHandlersDinamicos({
    ...t.d,
    sesion: async () => ({
      ok: true,
      sesion: { nombre: "Otro", email: "otro@example.com", rol: "Vendedor" },
    }),
  });
  assert.equal((await other.cotizaciones(req("GET", undefined, `?id=${c.id}`))).status, 404);
  assert.equal((await other.enviar(req("POST", { id: c.id }))).status, 404);
  assert.equal(t.sends(), 1);
});

test("fallo al guardar no devuelve una cotización emitida ni envía correos", async () => {
  const t = setup({
    guardar: async () => {
      throw new Error("Redis simulado no disponible");
    },
  });
  const response = await t.h.cotizaciones(req("POST", body));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).cotizacion, undefined);
  assert.equal(t.sends(), 0);
});
