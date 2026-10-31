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

type StoredMap = Record<string, string>;

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

export async function leerParametros(): Promise<{
  parametros: ParametrosCotizador;
  items: ParametroItem[];
  fuente: "redis" | "defaults";
}> {
  const mapa = await leerMapa();
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
