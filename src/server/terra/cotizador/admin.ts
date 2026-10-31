import type { Sesion } from "./session.js";
import { esAdminRol } from "../../../features/terra-cotizador/lib/parametros.js";

export function esAdmin(sesion: Sesion): boolean {
  return esAdminRol(sesion.rol);
}

export function noAdmin(): Response {
  return Response.json(
    { ok: false, error: "Se requiere rol Administrador." },
    { status: 403 },
  );
}
