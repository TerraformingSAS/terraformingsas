import { noAutorizado, validarSesion } from "./session.js";
import { registrarCotizacion } from "./cotizaciones-log.js";
import { esPlanMeses, esPorcentaje } from "../../../features/terra-cotizador/lib/financiacion.js";

type Body = {
  codigo?: unknown;
  loteId?: unknown;
  idLote?: unknown;
  nombre?: unknown;
  cc?: unknown;
  email?: unknown;
  referido?: unknown;
  porcentaje?: unknown;
  cuotas?: unknown;
  valorPreventa?: unknown;
  fecha?: unknown;
};

/** POST /api/cotizaciones/registrar — al generar (cualquier vendedor autenticado). */
export async function POST(req: Request): Promise<Response> {
  try {
    const sesion = await validarSesion(req);
    if (!sesion.ok) return noAutorizado(sesion.motivo);
    const body = (await req.json().catch(() => ({}))) as Body;

    const codigo = String(body.codigo ?? "").trim();
    const loteId = String(body.loteId ?? "").trim();
    const idLote = String(body.idLote ?? "").trim();
    const nombre = String(body.nombre ?? "").trim();
    const porcentaje = Number(body.porcentaje);
    const cuotas = Number(body.cuotas);
    const valorPreventa = Number(body.valorPreventa);
    const fecha = new Date(String(body.fecha ?? ""));

    if (
      !codigo ||
      !loteId ||
      !idLote ||
      nombre.length < 3 ||
      !esPorcentaje(porcentaje) ||
      !esPlanMeses(cuotas) ||
      !Number.isFinite(valorPreventa) ||
      Number.isNaN(fecha.getTime())
    ) {
      return Response.json({ ok: false, error: "La cotización está incompleta." }, { status: 400 });
    }

    const r = await registrarCotizacion({
      codigo,
      loteId,
      idLote,
      clienteNombre: nombre,
      clienteCC: String(body.cc ?? "").trim(),
      clienteEmail: String(body.email ?? "").trim(),
      vendedorNombre: sesion.sesion.nombre,
      vendedorEmail: sesion.sesion.email,
      porcentaje,
      cuotas,
      valorPreventa,
      fecha: fecha.toISOString(),
      referido: String(body.referido ?? "").trim(),
    });

    if (!r.ok) {
      // No bloquea la cotización del vendedor; solo informa.
      return Response.json({ ok: false, error: r.error }, { status: 202 });
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error("api-registrar-cotizacion", e);
    return Response.json({ ok: false, error: "No se pudo registrar la cotización." }, { status: 503 });
  }
}
