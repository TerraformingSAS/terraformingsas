import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { env } from "./env.js";

export const OTP_TTL_SEG = 600; // 10 minutos
export const OTP_MAX_INTENTOS = 5;
export const SOLICITUDES_MAX = 5; // por correo
export const SOLICITUDES_VENTANA_SEG = 900; // 15 minutos

export const normalizar = (e: unknown) =>
  String(e ?? "")
    .trim()
    .toLowerCase();
export const correoValido = (e: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 254;
export const nuevoCodigo = () => String(randomInt(0, 1_000_000)).padStart(6, "0");
export const hashCodigo = (email: string, codigo: string) =>
  createHmac("sha256", env("SESSION_SECRET")).update(`${email}:${codigo}`).digest("hex");

export function iguales(a: string, b: string): boolean {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
