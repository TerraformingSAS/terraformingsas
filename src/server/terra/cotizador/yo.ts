// GET /api/auth/yo -> { email, nombre, rol } | 401 { motivo }
import { noAutorizado, validarSesion } from "./session.js";

export async function GET(req: Request): Promise<Response> {
  try {
    const r = await validarSesion(req);
    if (!r.ok) return noAutorizado(r.motivo);
    return Response.json(r.sesion, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("yo", e);
    return Response.json({ error: "No se pudo validar la sesión" }, { status: 503 });
  }
}
