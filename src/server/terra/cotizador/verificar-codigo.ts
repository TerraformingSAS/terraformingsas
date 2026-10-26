// POST /api/auth/verificar-codigo  { email, codigo }  -> cookie de sesión
import { redis } from "./redis.js";
import { buscarVendedor } from "./vendedores.js";
import { crearSesion } from "./session.js";
import { OTP_MAX_INTENTOS, hashCodigo, iguales, normalizar } from "./otp.js";

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => ({}))) as { email?: unknown; codigo?: unknown };
  const email = normalizar(body.email);
  const codigo = String(body.codigo ?? "").replace(/\D/g, "");
  const fallo = () =>
    Response.json({ ok: false, error: "Código incorrecto o vencido." }, { status: 401 });
  if (!email || codigo.length !== 6) return fallo();

  try {
    const key = `otp:${email}`;
    const reg = await redis.get<{ h: string; i: number }>(key);
    if (!reg) return fallo();
    if (reg.i >= OTP_MAX_INTENTOS) {
      await redis.del(key);
      return fallo();
    }
    if (!iguales(reg.h, hashCodigo(email, codigo))) {
      await redis.set(key, { ...reg, i: reg.i + 1 }, { keepTtl: true });
      return fallo();
    }
    await redis.del(key);

    const vendedor = await buscarVendedor(email); // revalida que siga activo
    if (!vendedor) return fallo();
    const cookie = await crearSesion(vendedor);
    return Response.json(
      { ok: true, nombre: vendedor.nombre },
      { headers: { "Set-Cookie": cookie } },
    );
  } catch (e) {
    console.error("verificar-codigo", e);
    return Response.json(
      { ok: false, error: "No pudimos verificar el código. Intenta de nuevo." },
      { status: 503 },
    );
  }
}
