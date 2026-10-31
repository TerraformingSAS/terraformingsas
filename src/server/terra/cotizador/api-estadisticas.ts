import { noAutorizado, validarSesion } from "./session.js";
import { esAdmin, noAdmin } from "./admin.js";
import { estadisticasPorLote } from "./cotizaciones-log.js";

/** GET /api/admin/estadisticas */
export async function GET(req: Request): Promise<Response> {
  try {
    const sesion = await validarSesion(req);
    if (!sesion.ok) return noAutorizado(sesion.motivo);
    if (!esAdmin(sesion.sesion)) return noAdmin();
    const lotes = await estadisticasPorLote();
    return Response.json({ ok: true, lotes });
  } catch (e) {
    console.error("api-estadisticas", e);
    return Response.json({ ok: false, error: "No se pudieron cargar las estadísticas." }, { status: 503 });
  }
}
