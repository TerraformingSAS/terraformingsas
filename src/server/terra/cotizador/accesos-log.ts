// Historial de ingresos al cotizador (login OTP exitoso) · Upstash Redis.
import { redis } from "./redis.js";

export type AccesoRegistro = {
  email: string;
  nombre: string;
  rol: string;
  fecha: string; // ISO
};

const REDIS_KEY = "terra:accesos:log";
const REDIS_MAX = 2000;

export async function listarAccesos(): Promise<AccesoRegistro[]> {
  try {
    const raw = await redis.get<AccesoRegistro[]>(REDIS_KEY);
    return Array.isArray(raw) ? raw : [];
  } catch (e) {
    console.error("accesos-log redis get", e);
    return [];
  }
}

export async function registrarAcceso(
  reg: Omit<AccesoRegistro, "fecha"> & { fecha?: string },
): Promise<void> {
  try {
    const actual = await listarAccesos();
    const next: AccesoRegistro[] = [
      {
        email: reg.email,
        nombre: reg.nombre,
        rol: reg.rol,
        fecha: reg.fecha ?? new Date().toISOString(),
      },
      ...actual,
    ].slice(0, REDIS_MAX);
    await redis.set(REDIS_KEY, next);
  } catch (e) {
    console.error("accesos-log redis set", e);
  }
}
