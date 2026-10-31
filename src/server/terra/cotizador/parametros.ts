// Lectura/escritura de parámetros en Upstash Redis.
import { redis } from "./redis.js";
import {
  PARAMETROS_DEFAULT,
  PARAMETROS_SEED,
  itemsDesdeParametros,
  parametrosDesdeItems,
  type ParametroItem,
  type ParametrosCotizador,
} from "../../../features/terra-cotizador/lib/parametros.js";

const REDIS_KEY = "terra:cotizador:parametros";

/** Claves de copy que van en el PDF de cotización. */
export const CLAVES_MENSAJES_COTIZACION = [
  "msg_cuota_extra",
  "msg_cuotas_valorizacion",
  "msg_no_reserva",
  "empresa_nombre",
  "nit",
  "banco",
  "cuenta",
  "email_mercadeo",
  "telefono",
  "direccion",
  "vigencia_dias",
] as const;

type StoredMap = Record<string, string>;

function mapaDesdeSeed(claves?: readonly string[]): StoredMap {
  const allow = claves ? new Set(claves) : null;
  const out: StoredMap = {};
  for (const s of PARAMETROS_SEED) {
    if (allow && !allow.has(s.clave)) continue;
    out[s.clave] = s.valor;
  }
  return out;
}

/** Fusiona seed + valores guardados (Redis gana por clave). */
export function fusionarItems(stored: ParametroItem[]): ParametroItem[] {
  const byClave = new Map(stored.map((i) => [i.clave, i]));
  return PARAMETROS_SEED.map((seed) => {
    const hit = byClave.get(seed.clave);
    return hit
      ? {
          ...seed,
          valor: hit.valor,
          id: hit.id,
        }
      : { ...seed };
  });
}

async function leerMapa(): Promise<StoredMap | null> {
  try {
    const raw = await redis.get<StoredMap>(REDIS_KEY);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    return raw;
  } catch (e) {
    console.error("parametros redis get", e);
    return null;
  }
}

/**
 * Escribe en Redis los mensajes (y datos de pago/contacto) del PDF.
 * Por defecto no pisa claves que ya existan; con `forzar` sí.
 */
export async function sembrarMensajesCotizacion(
  opts: { forzar?: boolean } = {},
): Promise<{ ok: true; escritos: string[]; fuente: "redis" } | { ok: false; error: string }> {
  const seedMsgs = mapaDesdeSeed(CLAVES_MENSAJES_COTIZACION);
  try {
    const actual = (await leerMapa()) ?? {};
    const next: StoredMap = { ...actual };
    const escritos: string[] = [];
    for (const [clave, valor] of Object.entries(seedMsgs)) {
      if (!opts.forzar && Object.prototype.hasOwnProperty.call(actual, clave) && String(actual[clave] ?? "") !== "") {
        continue;
      }
      next[clave] = valor;
      escritos.push(clave);
    }
    await redis.set(REDIS_KEY, next);
    return { ok: true, escritos, fuente: "redis" };
  } catch (e) {
    console.error("parametros seed mensajes", e);
    return { ok: false, error: "No se pudieron sembrar los mensajes en Redis." };
  }
}

/**
 * Si Redis está vacío → seed completo.
 * Si faltan claves de mensajes/pagos/contacto del PDF → las completa sin pisar existentes.
 */
async function asegurarSeedEnRedis(): Promise<StoredMap | null> {
  const actual = await leerMapa();
  const seedCompleto = mapaDesdeSeed();
  const seedMsgs = mapaDesdeSeed(CLAVES_MENSAJES_COTIZACION);

  if (!actual || Object.keys(actual).length === 0) {
    try {
      await redis.set(REDIS_KEY, seedCompleto);
      console.info("parametros: sembrados defaults en Redis", Object.keys(seedCompleto).length);
      return seedCompleto;
    } catch (e) {
      console.error("parametros seed inicial", e);
      return null;
    }
  }

  const next: StoredMap = { ...actual };
  let wrote = false;
  for (const [clave, valor] of Object.entries(seedMsgs)) {
    if (!Object.prototype.hasOwnProperty.call(actual, clave) || String(actual[clave] ?? "") === "") {
      next[clave] = valor;
      wrote = true;
    }
  }
  if (wrote) {
    try {
      await redis.set(REDIS_KEY, next);
      console.info("parametros: completados mensajes faltantes en Redis");
      return next;
    } catch (e) {
      console.error("parametros seed mensajes faltantes", e);
      return actual;
    }
  }
  return actual;
}

export async function leerParametros(): Promise<{
  parametros: ParametrosCotizador;
  items: ParametroItem[];
  fuente: "redis" | "defaults";
}> {
  const mapa = await asegurarSeedEnRedis();
  if (!mapa || Object.keys(mapa).length === 0) {
    return {
      parametros: PARAMETROS_DEFAULT,
      items: itemsDesdeParametros(PARAMETROS_DEFAULT),
      fuente: "defaults",
    };
  }
  const stored: ParametroItem[] = Object.entries(mapa).map(([clave, valor]) => ({
    clave,
    valor: String(valor ?? ""),
    tipo: "texto",
    grupo: "calculo",
    descripcion: "",
  }));
  const items = fusionarItems(stored);
  return {
    parametros: parametrosDesdeItems(items),
    items,
    fuente: "redis",
  };
}

export async function guardarParametros(
  updates: { clave: string; valor: string }[],
): Promise<{ ok: true; items: ParametroItem[] } | { ok: false; error: string }> {
  const seedByClave = new Map(PARAMETROS_SEED.map((s) => [s.clave, s]));
  const actual = (await leerMapa()) ?? {};
  const next: StoredMap = { ...actual };

  for (const u of updates) {
    const clave = u.clave.trim();
    if (!clave || !seedByClave.has(clave)) continue;
    next[clave] = String(u.valor ?? "");
  }

  try {
    await redis.set(REDIS_KEY, next);
  } catch (e) {
    console.error("parametros redis set", e);
    return {
      ok: false,
      error: "No se pudieron guardar los parámetros en Redis (Upstash).",
    };
  }

  const { items } = await leerParametros();
  return { ok: true, items };
}
