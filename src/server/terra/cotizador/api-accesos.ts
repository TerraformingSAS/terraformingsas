import { noAutorizado, validarSesion } from "./session.js";
import { esAdmin, noAdmin } from "./admin.js";
import { listarAccesos } from "./accesos-log.js";

/** GET /api/admin/accesos */
export async function GET(req: Request): Promise<Response> {
  try {
    const sesion = await validarSesion(req);
    if (!sesion.ok) return noAutorizado(sesion.motivo);
    if (!esAdmin(sesion.sesion)) return noAdmin();
    const accesos = await listarAccesos();
    return Response.json({ ok: true, accesos });
  } catch (e) {
    console.error("api-accesos", e);
    return Response.json(
      { ok: false, error: "No se pudo cargar el log de accesos." },
      { status: 503 },
    );
  }
}
