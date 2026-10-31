import { noAutorizado, validarSesion } from "./session.js";
import { esAdmin, noAdmin } from "./admin.js";
import { guardarParametros, leerParametros } from "./parametros.js";

/** GET /api/parametros — cualquier sesión autenticada (lectura). */
export async function GET(req: Request): Promise<Response> {
  try {
    const sesion = await validarSesion(req);
    if (!sesion.ok) return noAutorizado(sesion.motivo);
    const data = await leerParametros();
    return Response.json({
      ok: true,
      parametros: data.parametros,
      items: data.items,
      fuente: data.fuente,
      admin: esAdmin(sesion.sesion),
    });
  } catch (e) {
    console.error("api-parametros GET", e);
    return Response.json({ ok: false, error: "No se pudieron leer los parámetros." }, { status: 503 });
  }
}

/** GET /api/admin/parametros — alias admin (misma lectura). */
export async function GET_ADMIN(req: Request): Promise<Response> {
  const sesion = await validarSesion(req);
  if (!sesion.ok) return noAutorizado(sesion.motivo);
  if (!esAdmin(sesion.sesion)) return noAdmin();
  return GET(req);
}

/** PUT /api/admin/parametros — solo Administrador. */
export async function PUT_ADMIN(req: Request): Promise<Response> {
  try {
    const sesion = await validarSesion(req);
    if (!sesion.ok) return noAutorizado(sesion.motivo);
    if (!esAdmin(sesion.sesion)) return noAdmin();

    const body = (await req.json().catch(() => ({}))) as {
      items?: { clave?: unknown; valor?: unknown }[];
    };
    const updates = (body.items ?? [])
      .map((i) => ({
        clave: String(i.clave ?? "").trim(),
        valor: String(i.valor ?? ""),
      }))
      .filter((i) => i.clave);

    if (updates.length === 0) {
      return Response.json({ ok: false, error: "No hay parámetros para guardar." }, { status: 400 });
    }

    const r = await guardarParametros(updates);
    if (!r.ok) return Response.json({ ok: false, error: r.error }, { status: 503 });

    const data = await leerParametros();
    return Response.json({
      ok: true,
      parametros: data.parametros,
      items: data.items,
      fuente: data.fuente,
    });
  } catch (e) {
    console.error("api-parametros PUT", e);
    return Response.json({ ok: false, error: "No se pudieron guardar los parámetros." }, { status: 503 });
  }
}
