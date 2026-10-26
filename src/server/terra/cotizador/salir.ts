// POST /api/auth/salir -> invalida la sesión y borra la cookie
import { cerrarSesion, cookieBorrar } from "./session.js";

export async function POST(req: Request): Promise<Response> {
  await cerrarSesion(req).catch(() => undefined);
  return Response.json({ ok: true }, { headers: { "Set-Cookie": cookieBorrar() } });
}
