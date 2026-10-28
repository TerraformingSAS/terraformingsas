// GET /api/lotes -> { lotes, actualizado }
// Precios: "Precios Pre_venta_agente.xlsx"; Estado: "TERRA_Control_Lotes.xlsx" (la misma fuente del mapa).
import { graph, GraphError } from "./graph.js";
import { env } from "./env.js";
import { noAutorizado, validarSesion } from "./session.js";

type Fila = Record<string, unknown>;

async function leerRangos(base: string, table: string, headers: Record<string, string>) {
  const t = encodeURIComponent(table);
  const cab = await graph<{ values: unknown[][] }>(
    `${base}/workbook/tables/${t}/headerRowRange?$select=values`,
    { headers },
  );
  const cuerpo = await graph<{ values: unknown[][] }>(
    `${base}/workbook/tables/${t}/dataBodyRange?$select=values`,
    { headers },
  );
  const meta = await graph<{ lastModifiedDateTime: string }>(`${base}?$select=lastModifiedDateTime`);
  const enc = cab.values[0].map(String);
  const filas: Fila[] = cuerpo.values
    .map((f) => Object.fromEntries(enc.map((h, i) => [h, f[i]])))
    .filter((r) => String(r.ID ?? "").trim() !== "");
  return { filas, modificado: new Date(meta.lastModifiedDateTime) };
}

/** Una sesión por libro y lecturas en serie. Graph responde 503 si el mismo xlsx se abre en paralelo. */
async function leerTabla(drive: string, item: string, table: string) {
  const base = `/drives/${drive}/items/${item}`;
  let sessionId = "";
  try {
    const sesion = await graph<{ id: string }>(`${base}/workbook/createSession`, {
      method: "POST",
      body: JSON.stringify({ persistChanges: false }),
    });
    sessionId = sesion.id;
    return await leerRangos(base, table, { "workbook-session-id": sessionId });
  } catch (e) {
    if (sessionId || !(e instanceof GraphError)) throw e;
    return leerRangos(base, table, {});
  } finally {
    if (sessionId) {
      await graph(`${base}/workbook/closeSession`, {
        method: "POST",
        headers: { "workbook-session-id": sessionId },
      }).catch(() => undefined);
    }
  }
}

export async function filasDePrecios(): Promise<{
  lotes: Record<string, unknown>[];
  actualizado: Date;
}> {
  const precios = await leerTabla(
    env("PRECIOS_DRIVE_ID"),
    env("PRECIOS_ITEM_ID"),
    process.env.PRECIOS_TABLE ?? "TablaPreciosPreVenta",
  );
  const mapa = await leerTabla(
    env("MAPA_DRIVE_ID"),
    env("MAPA_ITEM_ID"),
    process.env.MAPA_TABLE ?? "TablaLotes",
  );
  const estado = new Map(mapa.filas.map((r) => [String(r.ID), r.Estado]));
  const lotes = precios.filas.map((p) => ({
    ...p,
    Estado: estado.has(String(p.ID)) ? estado.get(String(p.ID)) : p.Estado,
  }));
  return {
    lotes,
    actualizado: new Date(Math.max(precios.modificado.getTime(), mapa.modificado.getTime())),
  };
}

export async function GET(req: Request): Promise<Response> {
  try {
    const sesion = await validarSesion(req);
    if (!sesion.ok) return noAutorizado(sesion.motivo);
    const { lotes, actualizado } = await filasDePrecios();
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
