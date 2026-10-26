// POST /api/auth/solicitar-codigo  { email }
// Responde igual exista o no el correo (no revela quién está autorizado).
import { redis } from "./redis.js";
import { graph } from "./graph.js";
import { env } from "./env.js";
import { buscarVendedor } from "./vendedores.js";
import {
  OTP_TTL_SEG,
  SOLICITUDES_MAX,
  SOLICITUDES_VENTANA_SEG,
  correoValido,
  hashCodigo,
  normalizar,
  nuevoCodigo,
} from "./otp.js";

export async function POST(req: Request): Promise<Response> {
  const ok = () => Response.json({ ok: true });
  const body = (await req.json().catch(() => ({}))) as { email?: unknown };
  const email = normalizar(body.email);
  if (!correoValido(email)) return ok();

  try {
    const n = await redis.incr(`otp:sol:${email}`);
    if (n === 1) await redis.expire(`otp:sol:${email}`, SOLICITUDES_VENTANA_SEG);
    if (n > SOLICITUDES_MAX) return ok();

    const vendedor = await buscarVendedor(email);
    if (!vendedor) return ok();

    const codigo = nuevoCodigo();
    await redis.set(`otp:${email}`, { h: hashCodigo(email, codigo), i: 0 }, { ex: OTP_TTL_SEG });

    await graph(`/users/${encodeURIComponent(env("MAIL_SENDER"))}/sendMail`, {
      method: "POST",
      body: JSON.stringify({
        message: {
          subject: `${codigo} es tu código de acceso al Cotizador TERRA`,
          body: { contentType: "HTML", content: correoHtml(vendedor.nombre, codigo) },
          toRecipients: [{ emailAddress: { address: email } }],
        },
        saveToSentItems: false,
      }),
    });
    return ok();
  } catch (e) {
    console.error("solicitar-codigo", e);
    return Response.json(
      { ok: false, error: "No pudimos enviar el código. Intenta de nuevo en unos minutos." },
      { status: 503 },
    );
  }
}

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

function correoHtml(nombre: string, codigo: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f5f3;font-family:Segoe UI,Arial,sans-serif;color:#1c2821">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:#111814;padding:18px 24px;color:#ffffff;font-weight:700;letter-spacing:4px;font-size:14px">TERRA <span style="color:#8cc56a">FORMING</span></td></tr>
<tr><td style="padding:28px 24px 8px">
<p style="margin:0 0 12px;font-size:15px">Hola ${esc(nombre)},</p>
<p style="margin:0 0 20px;font-size:15px">Tu código para ingresar al <b>Cotizador TERRA</b> es:</p>
<p style="margin:0 0 20px;font-size:34px;font-weight:700;letter-spacing:10px;text-align:center;background:#eaf3e3;border-radius:8px;padding:14px 0;color:#1c2821">${codigo}</p>
<p style="margin:0 0 8px;font-size:13px;color:#4b5563">Vence en 10 minutos. Si no lo solicitaste, ignora este correo.</p>
</td></tr>
<tr><td style="padding:16px 24px 24px;font-size:11px;color:#6b7280">TERRA FORMING S.A.S. · Cali, Valle del Cauca</td></tr>
</table></td></tr></table></body></html>`;
}
