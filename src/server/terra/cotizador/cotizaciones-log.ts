// Historial de cotizaciones: lista SharePoint "Cotizaciones Cotizador" (+ Redis si no hay lista).
import { graph } from "./graph.js";
import { env, envOptional } from "./env.js";
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

type SpItem = { id: string; fields: Record<string, unknown> };

const REDIS_KEY = "terra:cotizaciones:log";
const REDIS_MAX = 2000;

function listId(): string {
  return envOptional("SP_COTIZACIONES_LIST_ID").trim();
}

function site(): string {
  return env("SP_SITE_ID");
}

function fromFields(f: Record<string, unknown>): CotizacionRegistro {
  return {
    codigo: String(f.Title ?? ""),
    loteId: String(f.LoteId ?? ""),
    idLote: String(f.IdLote ?? ""),
    clienteNombre: String(f.ClienteNombre ?? ""),
    clienteCC: String(f.ClienteCC ?? ""),
    clienteEmail: String(f.ClienteEmail ?? ""),
    vendedorNombre: String(f.VendedorNombre ?? ""),
    vendedorEmail: String(f.VendedorEmail ?? ""),
    porcentaje: Number(f.Porcentaje ?? 0),
    cuotas: Number(f.Cuotas ?? 0),
    valorPreventa: Number(f.ValorPreventa ?? 0),
    fecha: String(f.Fecha ?? new Date().toISOString()),
    referido: String(f.Referido ?? ""),
  };
}

async function listarSp(): Promise<CotizacionRegistro[]> {
  const id = listId();
  if (!id) return [];
  const out: CotizacionRegistro[] = [];
  let url: string | undefined =
    `/sites/${site()}/lists/${id}/items?expand=fields(select=Title,LoteId,IdLote,ClienteNombre,ClienteCC,ClienteEmail,VendedorNombre,VendedorEmail,Porcentaje,Cuotas,ValorPreventa,Fecha,Referido)&$top=200`;
  while (url) {
    const r: { value: SpItem[]; "@odata.nextLink"?: string } = await graph(url);
    for (const row of r.value) out.push(fromFields(row.fields));
    url = r["@odata.nextLink"]?.replace("https://graph.microsoft.com/v1.0", "");
  }
  return out.sort((a, b) => b.fecha.localeCompare(a.fecha));
}

async function listarRedis(): Promise<CotizacionRegistro[]> {
  try {
    const raw = await redis.get<CotizacionRegistro[]>(REDIS_KEY);
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

async function guardarRedis(reg: CotizacionRegistro): Promise<void> {
  const actual = await listarRedis();
  const next = [reg, ...actual].slice(0, REDIS_MAX);
  await redis.set(REDIS_KEY, next);
}

export async function registrarCotizacion(reg: CotizacionRegistro): Promise<{ ok: boolean; error?: string }> {
  const id = listId();
  if (id) {
    try {
      await graph(`/sites/${site()}/lists/${id}/items`, {
        method: "POST",
        body: JSON.stringify({
          fields: {
            Title: reg.codigo,
            LoteId: reg.loteId,
            IdLote: reg.idLote,
            ClienteNombre: reg.clienteNombre,
            ClienteCC: reg.clienteCC,
            ClienteEmail: reg.clienteEmail,
            VendedorNombre: reg.vendedorNombre,
            VendedorEmail: reg.vendedorEmail,
            Porcentaje: reg.porcentaje,
            Cuotas: reg.cuotas,
            ValorPreventa: reg.valorPreventa,
            Fecha: reg.fecha,
            Referido: reg.referido,
          },
        }),
      });
      return { ok: true };
    } catch (e) {
      console.error("cotizaciones-log SP", e);
      // Fallback Redis para no perder el registro si SP falla.
      try {
        await guardarRedis(reg);
        return { ok: true };
      } catch (e2) {
        console.error("cotizaciones-log redis", e2);
        return { ok: false, error: "No se pudo registrar la cotización." };
      }
    }
  }

  try {
    await guardarRedis(reg);
    return { ok: true };
  } catch (e) {
    console.error("cotizaciones-log redis", e);
    return {
      ok: false,
      error:
        "Falta SP_COTIZACIONES_LIST_ID y Redis no está disponible para el historial.",
    };
  }
}

export async function estadisticasPorLote(): Promise<LoteStats[]> {
  let rows: CotizacionRegistro[] = [];
  try {
    rows = await listarSp();
  } catch (e) {
    console.error("estadisticas SP", e);
  }
  if (rows.length === 0) {
    rows = await listarRedis();
  }

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
