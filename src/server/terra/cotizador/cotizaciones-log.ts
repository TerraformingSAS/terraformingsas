// Historial de cotizaciones para métricas admin · Upstash Redis.
import { redis } from "./redis.js";

export type CotizacionRegistro = {
  codigo: string;
  loteId: string;
  idLote: string;
  clienteNombre: string;
  clienteCC: string;
  clienteEmail: string;
  vendedorNombre: string;
  vendedorEmail: string;
  porcentaje: number;
  cuotas: number;
  valorPreventa: number;
  fecha: string; // ISO
  referido: string;
};

export type LoteStats = {
  idLote: string;
  loteId: string;
  total: number;
  items: CotizacionRegistro[];
};

const REDIS_KEY = "terra:cotizaciones:log";
const REDIS_MAX = 2000;

async function listarRedis(): Promise<CotizacionRegistro[]> {
  try {
    const raw = await redis.get<CotizacionRegistro[]>(REDIS_KEY);
    return Array.isArray(raw) ? raw : [];
  } catch (e) {
    console.error("cotizaciones-log redis get", e);
    return [];
  }
}

export async function registrarCotizacion(
  reg: CotizacionRegistro,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actual = await listarRedis();
    const next = [reg, ...actual].slice(0, REDIS_MAX);
    await redis.set(REDIS_KEY, next);
    return { ok: true };
  } catch (e) {
    console.error("cotizaciones-log redis set", e);
    return {
      ok: false,
      error: "No se pudo registrar la cotización en Redis (Upstash).",
    };
  }
}

export async function estadisticasPorLote(): Promise<LoteStats[]> {
  const rows = await listarRedis();
  const map = new Map<string, LoteStats>();
  for (const r of rows) {
    const key = r.idLote || r.loteId || "—";
    let g = map.get(key);
    if (!g) {
      g = { idLote: r.idLote || key, loteId: r.loteId, total: 0, items: [] };
      map.set(key, g);
    }
    g.total += 1;
    g.items.push(r);
  }
  for (const g of map.values()) {
    g.items.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }
  return [...map.values()].sort((a, b) => b.total - a.total || a.idLote.localeCompare(b.idLote));
}
