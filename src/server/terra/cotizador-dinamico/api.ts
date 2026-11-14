import { randomUUID } from "node:crypto";
import { redis } from "../cotizador/redis.js";
import { noAutorizado, validarSesion } from "../cotizador/session.js";
import { filasDePrecios } from "../cotizador/lotes.js";
import { leerParametros } from "../cotizador/parametros.js";
import { graph } from "../cotizador/graph.js";
import { env } from "../cotizador/env.js";
import { inconsistenciasExcel, toLote } from "../../../features/terra-cotizador/lib/lotes.js";
import {
  PARAMETROS_DINAMICOS,
  validarParametrosDinamicos,
} from "../../../features/terra-cotizador-dinamico/lib/parametros.ts";
import type { CotizacionDinamica } from "../../../features/terra-cotizador-dinamico/lib/types.ts";
import { crearHandlersDinamicos } from "./handlers.ts";

const PARAMETROS_KEY = "terra:cotizador-dinamico:parametros";
const cotizacionKey = (id: string) => `terra:cotizador-dinamico:cotizacion:${id}`;
const esc = (s: unknown) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
const cop = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export const handlersDinamicos = crearHandlersDinamicos({
  sesion: validarSesion,
  noAutorizado,
  async leerParametros() {
    const stored = await redis.get<unknown>(PARAMETROS_KEY);
    return stored === null ? { ...PARAMETROS_DINAMICOS } : validarParametrosDinamicos(stored);
  },
  async guardarParametros(p) {
    await redis.set(PARAMETROS_KEY, p);
  },
  async lote(id) {
    const [{ lotes }, { parametros: p }] = await Promise.all([filasDePrecios(), leerParametros()]);
    const lote = lotes.map(toLote).find((l) => l?.id === id);
    if (!lote) return null;
    return {
      lote,
      // La separación del Excel pertenece al cotizador fijo; el dinámico valida su propio mínimo.
      errores: inconsistenciasExcel(lote, {
        tarifa: p.tarifaPreventa,
        separacionCop: lote.separacion,
      }),
      comercial: {
        vigenciaDias: p.vigenciaDias,
        msgNoReserva: p.msgNoReserva,
        empresaNombre: p.empresaNombre,
        nit: p.nit,
        banco: p.banco,
        cuenta: p.cuenta,
        emailMercadeo: p.emailMercadeo,
        telefono: p.telefono,
        direccion: p.direccion,
      },
    };
  },
  async guardar(c) {
    await redis.set(cotizacionKey(c.id), c);
  },
  leer: (id) => redis.get<CotizacionDinamica>(cotizacionKey(id)),
  id: randomUUID,
  ahora: () => new Date().toISOString(),
  async enviar(c) {
    const fila = (k: string, v: unknown) =>
      `<tr><th style="text-align:left;padding:6px">${esc(k)}</th><td style="padding:6px">${esc(v)}</td></tr>`;
    const rows = c.plan.filas
      .map(
        (f) =>
          `<tr>${[f.periodo, f.fecha, cop(f.saldoInicial), cop(f.interes), cop(f.cuota), cop(f.abonos), cop(f.saldoFinal)].map((v) => `<td style="padding:5px;border:1px solid #ddd">${esc(v)}</td>`).join("")}</tr>`,
      )
      .join("");
    const extras = c.condiciones.abonos
      .map(
        (a) =>
          `<li>Mes ${a.periodo}: ${esc(a.concepto || "Abono adicional")} · ${esc(cop(a.valor))} solicitado (ver valor aplicado en el plan).</li>`,
      )
      .join("");
    const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#0e2a47"><h1>Cotizador dinámico · ${esc(c.codigo)}</h1><table>
      ${fila("Comprador", c.cliente.nombre)}${fila("Cédula", c.cliente.cc)}${fila("Correo", c.cliente.email)}${fila("Asesor", c.vendedor.nombre)}${fila("Referido", c.cliente.referido)}
      ${fila("Lote", c.lote.idLote)}${fila("Precio preventa", cop(c.plan.valorPreventa))}${fila("Separación", cop(c.plan.separacion))}
      ${fila("Financiación", `${c.condiciones.porcentaje}% · ${cop(c.plan.financiado)}`)}${fila("Tasa mensual vencida", `${c.plan.tasaMensual * 100}%`)}${fila("Mensualidades", c.condiciones.periodos)}
      ${fila("Intereses hasta entrega", c.condiciones.interesesHastaEntrega ? "Sí; meses completos y fracción efectiva por días" : "No; cesan después de la última mensualidad")}
      ${fila("Intereses totales", cop(c.plan.interesesTotales))}${fila("Pago final adicional a la entrega", cop(c.plan.pagoFinal))}${fila("Fecha de entrega", c.condiciones.fechaEntrega)}${fila("Total proyectado", cop(c.plan.totalPagar))}
      </table><p>Pagos al cierre del período. Intereses no cubiertos capitalizados. El 30% reservado, cuando aplica, no genera intereses. Valores redondeados para presentación.</p>
      <table style="border-collapse:collapse"><thead><tr>${["Período", "Fecha", "Saldo inicial", "Interés", "Cuota", "Abonos", "Saldo final"].map((v) => `<th>${v}</th>`).join("")}</tr></thead><tbody>
      <tr><td>0</td><td>${esc(c.condiciones.fechaSeparacion)}</td><td colspan="5">Separación ${esc(cop(c.plan.separacion))} · financiado ${esc(cop(c.plan.financiado))}</td></tr>${rows}
      <tr><td>Entrega</td><td>${esc(c.condiciones.fechaEntrega)}</td><td colspan="5">Pago final ${esc(cop(c.plan.pagoFinal))} · saldo total $0</td></tr></tbody></table><ul>${extras}</ul>
      <p>${esc(c.comercial.msgNoReserva)}</p></body></html>`;
    await graph(`/users/${encodeURIComponent(env("MAIL_SENDER"))}/sendMail`, {
      method: "POST",
      body: JSON.stringify({
        message: {
          subject: c.codigo,
          body: { contentType: "HTML", content: html },
          toRecipients: [{ emailAddress: { address: c.comercial.emailMercadeo } }],
        },
        saveToSentItems: false,
      }),
    });
  },
});
