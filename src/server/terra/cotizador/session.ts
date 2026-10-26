// Sesión: cookie httpOnly con JWT (máx. 4 h) + registro en Redis que vence tras 30 min sin actividad.
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { env } from "./env.js";
import { redis } from "./redis.js";
import { buscarVendedor } from "./vendedores.js";

export const COOKIE = "terra_session";
export const SESION_MAX_SEG = 4 * 3600; // duración máxima: 4 horas
export const INACTIVIDAD_SEG = 30 * 60; // cierre por inactividad: 30 minutos

const key = () => new TextEncoder().encode(env("SESSION_SECRET"));

export type Sesion = { email: string; nombre: string; rol: string };
type Token = Sesion & { sid: string };

export async function crearSesion(s: Sesion): Promise<string> {
  const sid = randomUUID();
  await redis.set(`ses:${sid}`, { email: s.email }, { ex: INACTIVIDAD_SEG });
  const payload = Buffer.from(
    JSON.stringify({ ...s, sid, exp: Math.floor(Date.now() / 1000) + SESION_MAX_SEG }),
  ).toString("base64url");
  const signature = createHmac("sha256", key()).update(payload).digest("base64url");
  const jwt = `${payload}.${signature}`;
  return `${COOKIE}=${jwt}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESION_MAX_SEG}`;
}

export const cookieBorrar = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

async function leerToken(req: Request): Promise<Token | null> {
  const raw = req.headers.get("cookie") ?? "";
  const m = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m) return null;
  try {
    const [payload, signature] = m[1].split(".");
    if (!payload || !signature) return null;
    const expected = createHmac("sha256", key()).update(payload).digest();
    const received = Buffer.from(signature, "base64url");
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Token & {
      exp: number;
    };
    if (!data.sid || !Number.isFinite(data.exp) || data.exp <= Date.now() / 1000) return null;
    return { email: data.email, nombre: data.nombre, rol: data.rol, sid: data.sid };
  } catch {
    return null; // firma inválida o pasaron las 4 horas
  }
}

export type Motivo = "vencida" | "inactividad" | "desactivado";
export type Resultado = { ok: true; sesion: Sesion } | { ok: false; motivo: Motivo };

/**
 * Valida la sesión en cada llamada a la API:
 *  - JWT vigente (máximo 4 h),
 *  - registro en Redis vigente (30 min sin actividad lo borra),
 *  - el vendedor sigue Activo en la lista de SharePoint (si no, sale de inmediato).
 * El navegador envía "X-Ultima-Actividad" (epoch ms de la última interacción real del usuario):
 * solo la actividad real extiende la sesión, no las consultas automáticas.
 */
export async function validarSesion(req: Request): Promise<Resultado> {
  const t = await leerToken(req);
  if (!t) return { ok: false, motivo: "vencida" };

  const reg = await redis.get<{ email: string }>(`ses:${t.sid}`);
  if (!reg || reg.email !== t.email) return { ok: false, motivo: "inactividad" };

  const ahora = Date.now();
  const hdr = Number(req.headers.get("x-ultima-actividad"));
  if (Number.isFinite(hdr) && hdr > 0) {
    const ultima = Math.min(hdr, ahora);
    const restante = Math.ceil((ultima + INACTIVIDAD_SEG * 1000 - ahora) / 1000);
    if (restante <= 0) {
      await redis.del(`ses:${t.sid}`);
      return { ok: false, motivo: "inactividad" };
    }
    await redis.expire(`ses:${t.sid}`, restante);
  }

  const vendedor = await buscarVendedor(t.email);
  if (!vendedor) {
    await redis.del(`ses:${t.sid}`);
    return { ok: false, motivo: "desactivado" };
  }
  return { ok: true, sesion: vendedor };
}

export async function cerrarSesion(req: Request): Promise<void> {
  const t = await leerToken(req);
  if (t) await redis.del(`ses:${t.sid}`);
}

export function noAutorizado(motivo: Motivo): Response {
  return Response.json(
    { error: "No autorizado", motivo },
    { status: 401, headers: { "Set-Cookie": cookieBorrar(), "Cache-Control": "no-store" } },
  );
}
