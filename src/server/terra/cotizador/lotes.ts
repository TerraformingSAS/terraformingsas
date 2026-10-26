// GET /api/lotes -> { lotes, actualizado }
// Precios: "Precios Pre_venta_agente.xlsx"; Estado: "TERRA_Control_Lotes.xlsx" (la misma fuente del mapa).
import { graph, GraphError } from "./graph.js";
import { env } from "./env.js";
import { noAutorizado, validarSesion } from "./session.js";

type Fila = Record<string, unknown>;

async function leerTabla(drive: string, item: string, table: string) {
  const base = `/drives/${drive}/items/${item}`;
  const t = encodeURIComponent(table);
  const [cab, cuerpo, meta] = await Promise.all([
    graph<{ values: unknown[][] }>(`${base}/workbook/tables/${t}/headerRowRange?$select=values`),
    graph<{ values: unknown[][] }>(`${base}/workbook/tables/${t}/dataBodyRange?$select=values`),
    graph<{ lastModifiedDateTime: string }>(`${base}?$select=lastModifiedDateTime`),
  ]);
  const enc = cab.values[0].map(String);
  const filas: Fila[] = cuerpo.values
    .map((f) => Object.fromEntries(enc.map((h, i) => [h, f[i]])))
    .filter((r) => String(r.ID ?? "").trim() !== "");
  return { filas, modificado: new Date(meta.lastModifiedDateTime) };
}

export async function GET(req: Request): Promise<Response> {
  try {
    const sesion = await validarSesion(req);
    if (!sesion.ok) return noAutorizado(sesion.motivo);
    const [precios, mapa] = await Promise.all([
      leerTabla(
        env("PRECIOS_DRIVE_ID"),
        env("PRECIOS_ITEM_ID"),
        process.env.PRECIOS_TABLE ?? "TablaPreciosPreVenta",
      ),
      leerTabla(env("MAPA_DRIVE_ID"), env("MAPA_ITEM_ID"), process.env.MAPA_TABLE ?? "TablaLotes"),
    ]);
    const estado = new Map(mapa.filas.map((r) => [String(r.ID), r.Estado]));
    const lotes = precios.filas.map((p) => ({
      ...p,
      Estado: estado.has(String(p.ID)) ? estado.get(String(p.ID)) : p.Estado,
    }));
    const actualizado = new Date(Math.max(precios.modificado.getTime(), mapa.modificado.getTime()));
    return Response.json(
      { lotes, actualizado: actualizado.toISOString() },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    const status = e instanceof GraphError ? e.status : 500;
    console.error("lotes", e);
    return Response.json(
      { error: "No se pudieron leer los precios", status },
      { status: status === 403 || status === 404 ? status : 502 },
    );
  }
}
