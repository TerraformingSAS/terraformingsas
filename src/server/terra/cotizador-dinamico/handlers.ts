import {
  calcularPlanDinamico,
  validarCondiciones,
} from "../../../features/terra-cotizador-dinamico/lib/plan.ts";
import {
  validarParametrosDinamicos,
  type ParametrosDinamicos,
} from "../../../features/terra-cotizador-dinamico/lib/parametros.ts";
import {
  validarCliente,
  type CotizacionDinamica,
} from "../../../features/terra-cotizador-dinamico/lib/types.ts";

type Usuario = { nombre: string; email: string; rol: string };
type Acceso =
  { ok: true; sesion: Usuario } | { ok: false; motivo: "vencida" | "inactividad" | "desactivado" };
type ContextoLote = {
  lote: CotizacionDinamica["lote"] & { estado: string };
  comercial: CotizacionDinamica["comercial"];
  errores: string[];
};
export type DependenciasDinamicas = {
  sesion: (req: Request) => Promise<Acceso>;
  noAutorizado: (motivo: "vencida" | "inactividad" | "desactivado") => Response;
  leerParametros: () => Promise<ParametrosDinamicos>;
  guardarParametros: (p: ParametrosDinamicos) => Promise<void>;
  lote: (id: string) => Promise<ContextoLote | null>;
  guardar: (c: CotizacionDinamica) => Promise<void>;
  leer: (id: string) => Promise<CotizacionDinamica | null>;
  enviar: (c: CotizacionDinamica) => Promise<void>;
  id: () => string;
  ahora: () => string;
};

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
const error = (text: string, status = 400) => json({ ok: false, error: text }, status);
const admin = (u: Usuario) => u.rol.trim().toLowerCase() === "administrador";
const message = (e: unknown) => (e instanceof Error ? e.message : "Datos inválidos.");

/** Dependencias inyectables para probar permisos y persistencia sin servicios reales. */
export function crearHandlersDinamicos(d: DependenciasDinamicas) {
  return {
    async parametros(req: Request): Promise<Response> {
      try {
        const s = await d.sesion(req);
        if (!s.ok) return d.noAutorizado(s.motivo);
        if (req.method === "GET")
          return json({ ok: true, parametros: await d.leerParametros(), admin: admin(s.sesion) });
        if (req.method !== "PUT") return error("Método no permitido.", 405);
        if (!admin(s.sesion)) return error("Se requiere rol Administrador.", 403);
        let p: ParametrosDinamicos;
        try {
          p = validarParametrosDinamicos(await req.json());
        } catch (e) {
          return error(message(e));
        }
        await d.guardarParametros(p);
        return json({ ok: true, parametros: p });
      } catch (e) {
        console.error("cotizador-dinamico parametros", e);
        return error("No se pudieron consultar o guardar los parámetros. Intenta de nuevo.", 503);
      }
    },
    async cotizaciones(req: Request): Promise<Response> {
      try {
        const s = await d.sesion(req);
        if (!s.ok) return d.noAutorizado(s.motivo);
        if (req.method === "GET") {
          const id = new URL(req.url).searchParams.get("id") ?? "";
          if (!/^[\w-]{1,100}$/.test(id)) return error("Código de cotización inválido.");
          const c = await d.leer(id);
          if (!c || (!admin(s.sesion) && c.vendedor.email !== s.sesion.email))
            return error("Cotización no encontrada.", 404);
          return json({ ok: true, cotizacion: c });
        }
        if (req.method !== "POST") return error("Método no permitido.", 405);
        let body: Record<string, unknown>;
        try {
          body = await req.json();
          if (
            !body ||
            typeof body !== "object" ||
            typeof body.loteId !== "string" ||
            body.loteId.length > 100
          )
            throw new Error("Selecciona un lote válido.");
        } catch (e) {
          return error(message(e));
        }
        const parametros = await d.leerParametros();
        let expected: ParametrosDinamicos;
        try {
          expected = validarParametrosDinamicos(body.parametros);
        } catch (e) {
          return error(message(e));
        }
        if (JSON.stringify(expected) !== JSON.stringify(parametros))
          return error(
            "Los parámetros cambiaron. Actualiza la página y revisa el plan antes de generar.",
            409,
          );
        const contexto = await d.lote(body.loteId as string);
        if (!contexto || contexto.lote.estado !== "disponible")
          return error("El lote ya no está disponible. Actualiza el inventario.", 409);
        if (contexto.errores.length) return error(contexto.errores.join(" "), 422);
        if (body.valorPreventa !== contexto.lote.valorPreventa)
          return error("El precio del lote cambió. Actualiza el inventario y revisa el plan.", 409);
        let cliente, condiciones, plan;
        try {
          cliente = validarCliente(body.cliente);
          condiciones = validarCondiciones(
            body.condiciones,
            contexto.lote.valorPreventa,
            parametros,
          );
          plan = calcularPlanDinamico(contexto.lote.valorPreventa, condiciones, parametros);
        } catch (e) {
          return error(message(e));
        }
        const id = d.id();
        const cotizacion: CotizacionDinamica = {
          version: 1,
          id,
          codigo: `CTD-${contexto.lote.idLote}-${id.slice(0, 8).toUpperCase()}`,
          fecha: d.ahora(),
          lote: {
            id: contexto.lote.id,
            idLote: contexto.lote.idLote,
            area: contexto.lote.area,
            valorPreventa: contexto.lote.valorPreventa,
          },
          cliente,
          vendedor: { nombre: s.sesion.nombre, email: s.sesion.email },
          condiciones,
          parametros,
          comercial: contexto.comercial,
          plan,
        };
        await d.guardar(cotizacion);
        return json({ ok: true, cotizacion }, 201);
      } catch (e) {
        console.error("cotizador-dinamico cotizaciones", e);
        return error(
          "No se pudo guardar la cotización. Conserva tus datos e intenta de nuevo.",
          503,
        );
      }
    },
    async enviar(req: Request): Promise<Response> {
      try {
        const s = await d.sesion(req);
        if (!s.ok) return d.noAutorizado(s.motivo);
        if (req.method !== "POST") return error("Método no permitido.", 405);
        const body = await req.json().catch(() => null);
        if (!body || typeof body.id !== "string" || !/^[\w-]{1,100}$/.test(body.id))
          return error("Selecciona una cotización guardada.");
        const c = await d.leer(body.id);
        if (!c || (!admin(s.sesion) && c.vendedor.email !== s.sesion.email))
          return error("Cotización no encontrada.", 404);
        await d.enviar(c);
        return json({ ok: true });
      } catch (e) {
        console.error("cotizador-dinamico enviar", e);
        return error("No se pudo enviar la cotización a mercadeo. Puedes reintentar.", 503);
      }
    },
  };
}
