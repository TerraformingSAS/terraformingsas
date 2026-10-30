// POST /api/cotizaciones/enviar  — al descargar, no al generar.
import { graph } from "./graph.js";
import { env } from "./env.js";
import { noAutorizado, validarSesion } from "./session.js";
import { filasDePrecios } from "./lotes.js";
import {
  etapaRomana,
  fmtCOP,
  fmtNum,
  fmtPct,
  diferenciasTarifa,
  inconsistenciasExcel,
  toLote,
} from "../../../features/terra-cotizador/lib/lotes.js";
import {
  calcularFinanciacion,
  esPlanMeses,
  esPorcentaje,
} from "../../../features/terra-cotizador/lib/financiacion.js";

const DESTINO = "mercadeo@terraformings.co";

type Body = {
  id?: unknown;
  nombre?: unknown;
  cc?: unknown;
  email?: unknown;
  referido?: unknown;
  cuotas?: unknown;
  porcentaje?: unknown;
  fecha?: unknown;
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const fechaLarga = (d: Date) =>
  new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);

export async function POST(req: Request): Promise<Response> {
  try {
    const sesion = await validarSesion(req);
    if (!sesion.ok) return noAutorizado(sesion.motivo);
    const body = (await req.json().catch(() => ({}))) as Body;
    const id = String(body.id ?? "").trim();
    const nombre = String(body.nombre ?? "").trim();
    const cuotas = Number(body.cuotas);
    const porcentaje = Number(body.porcentaje);
    const fecha = new Date(String(body.fecha ?? ""));
    if (
      !id ||
      nombre.length < 3 ||
      !esPlanMeses(cuotas) ||
      !esPorcentaje(porcentaje) ||
      Number.isNaN(fecha.getTime())
    ) {
      return Response.json({ ok: false, error: "La cotización está incompleta." }, { status: 400 });
    }

    const { lotes } = await filasDePrecios();
    const lote = lotes.map(toLote).find((l) => l?.id === id) ?? null;
    if (!lote || lote.estado !== "disponible") {
      return Response.json(
        { ok: false, error: "El lote ya no está disponible en el Excel." },
        { status: 409 },
      );
    }
    const fallas = inconsistenciasExcel(lote);
    if (fallas.length > 0) {
      return Response.json({ ok: false, error: fallas.join(" ") }, { status: 422 });
    }

    const plan = calcularFinanciacion(lote.valorPreventa, porcentaje, cuotas);
    const cc = String(body.cc ?? "").trim();
    const email = String(body.email ?? "").trim();
    const referido = String(body.referido ?? "").trim();
    const codigo = String(body.codigo ?? "").trim();
    const asunto = codigo || `Cotización lote ${lote.idLote}`;

    await graph(`/users/${encodeURIComponent(env("MAIL_SENDER"))}/sendMail`, {
      method: "POST",
      body: JSON.stringify({
        message: {
          subject: asunto,
          body: {
            contentType: "HTML",
            content: correoHtml({
              codigo: asunto,
              nombre,
              cc,
              email,
              referido,
              vendedor: sesion.sesion.nombre,
              lote: lote.idLote,
              area: fmtNum(lote.area),
              etapa: etapaRomana(lote.etapa),
              valor: fmtCOP(lote.valorPreventa),
              separacion: fmtCOP(plan.separacion),
              financiar: fmtCOP(plan.valorFinanciar),
              descuento: fmtPct(lote.descuento),
              porcentaje: plan.porcentaje,
              contraEntrega: fmtCOP(plan.saldoContraEntrega),
              cuotas,
              cuota: fmtCOP(plan.cuota),
              fecha: fechaLarga(fecha),
            }),
          },
          toRecipients: [{ emailAddress: { address: DESTINO } }],
        },
        saveToSentItems: false,
      }),
    });
    return Response.json({ ok: true });
  } catch (e) {
    console.error("enviar-cotizacion", e);
    return Response.json(
      { ok: false, error: "No se pudo enviar la cotización a mercadeo." },
      { status: 503 },
    );
  }
}

export async function alertar(req: Request): Promise<Response> {
  try {
    const sesion = await validarSesion(req);
    if (!sesion.ok) return noAutorizado(sesion.motivo);
    const body = (await req.json().catch(() => ({}))) as { id?: unknown };
    const id = String(body.id ?? "").trim();
    if (!id) return Response.json({ ok: false }, { status: 400 });
    const { lotes } = await filasDePrecios();
    const lote = lotes.map(toLote).find((l) => l?.id === id) ?? null;
    if (!lote) return Response.json({ ok: false, error: "Lote no encontrado" }, { status: 404 });
    const diferencias = diferenciasTarifa(lote);
    if (diferencias.length === 0) return Response.json({ ok: true, aviso: false });
    await graph(`/users/${encodeURIComponent(env("MAIL_SENDER"))}/sendMail`, {
      method: "POST",
      body: JSON.stringify({
        message: {
          subject: `Precio distinto a la tabla · lote ${lote.idLote}`,
          body: {
            contentType: "HTML",
            content: `<!doctype html><html><body style="font-family:Segoe UI,Arial,sans-serif;color:#0e2a47">
<p>El cotizador no generó la cotización del lote <b>${esc(lote.idLote)}</b> porque el Excel no coincide con la tabla de preventa.</p>
<ul>${diferencias.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>
<p style="color:#263746">Excel: ${esc(fmtNum(lote.area))} m² · ${esc(fmtCOP(lote.valorM2))} por m² · preventa ${esc(fmtCOP(lote.valorPreventa))}</p>
<p style="color:#263746">Aviso de ${esc(sesion.sesion.nombre)} · ${esc(fechaLarga(new Date()))}</p>
</body></html>`,
          },
          toRecipients: [{ emailAddress: { address: DESTINO } }],
        },
        saveToSentItems: false,
      }),
    });
    return Response.json({ ok: true, aviso: true });
  } catch (e) {
    console.error("alerta-precios", e);
    return Response.json({ ok: false }, { status: 503 });
  }
}

function correoHtml(d: {
  codigo: string;
  nombre: string;
  cc: string;
  email: string;
  referido: string;
  vendedor: string;
  lote: string;
  area: string;
  etapa: string;
  valor: string;
  separacion: string;
  financiar: string;
  descuento: string;
  porcentaje: number;
  contraEntrega: string;
  cuotas: number;
  cuota: string;
  fecha: string;
}): string {
  const fila = (k: string, v: string) =>
    `<tr><td style="padding:6px 10px;color:#263746">${esc(k)}</td><td style="padding:6px 10px;font-weight:700;color:#0e2a47">${esc(v)}</td></tr>`;
  return `<!doctype html><html><body style="margin:0;background:#f4f6f7;font-family:Segoe UI,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#0e2a47;padding:16px 20px;color:#fff;font-weight:700;letter-spacing:2px">TERRA <span style="color:#8fbf7a">FORMING</span></td></tr>
<tr><td style="padding:20px">
<p style="margin:0 0 8px;font-size:13px;color:#263746">Cotización descargada</p>
<p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#0e2a47">${esc(d.codigo)}</p>
<table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px">
${fila("Cliente", d.nombre)}
${d.cc ? fila("Cédula", d.cc) : ""}
${d.email ? fila("Correo", d.email) : ""}
${fila("Vendedor", d.vendedor)}
${d.referido ? fila("Referenciado por", d.referido) : ""}
${fila("Lote", `${d.lote} · ${d.area} m²`)}
${fila("Etapa", d.etapa)}
${fila("Valor preventa", d.valor)}
${fila("Descuento", d.descuento)}
${fila("Separación", d.separacion)}
${fila("A financiar", `${d.porcentaje}% · ${d.financiar}`)}
${fila("Cuotas", `${d.cuotas} × ${d.cuota}`)}
${fila("Contra entrega", d.contraEntrega)}
${fila("Generada", d.fecha)}
${fila("Vigencia", "5 días calendario")}
</table>
</td></tr></table></td></tr></table></body></html>`;
}
