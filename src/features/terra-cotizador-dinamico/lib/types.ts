import type { CondicionesDinamicas, PlanDinamico } from "./plan.ts";
import type { ParametrosDinamicos } from "./parametros.ts";
import type { ParametrosCotizador } from "../../terra-cotizador/lib/parametros";

export type ClienteDinamico = { nombre: string; cc: string; email: string; referido: string };
export type CotizacionDinamica = {
  version: 1;
  id: string;
  codigo: string;
  fecha: string;
  lote: { id: string; idLote: string; area: number; valorPreventa: number };
  cliente: ClienteDinamico;
  vendedor: { nombre: string; email: string };
  condiciones: CondicionesDinamicas;
  parametros: ParametrosDinamicos;
  comercial: Pick<
    ParametrosCotizador,
    | "vigenciaDias"
    | "msgNoReserva"
    | "empresaNombre"
    | "nit"
    | "banco"
    | "cuenta"
    | "emailMercadeo"
    | "telefono"
    | "direccion"
  >;
  plan: PlanDinamico;
};

export function validarCliente(value: unknown): ClienteDinamico {
  if (!value || typeof value !== "object") throw new Error("Ingresa los datos del comprador.");
  const raw = value as Record<string, unknown>;
  const text = (key: string, max: number) => {
    if (typeof raw[key] !== "string" || raw[key].length > max)
      throw new Error(`El campo ${key} es inválido.`);
    return raw[key].trim();
  };
  const c = {
    nombre: text("nombre", 200),
    cc: text("cc", 11),
    email: text("email", 254),
    referido: text("referido", 200),
  };
  if (c.nombre.length < 3) throw new Error("Escribe el nombre completo del comprador.");
  if (!c.cc && !c.email) throw new Error("Ingresa la cédula o el correo del comprador.");
  if (c.cc && !/^\d{5,11}$/.test(c.cc)) throw new Error("La cédula debe tener de 5 a 11 dígitos.");
  if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))
    throw new Error("El correo del comprador no es válido.");
  return c;
}
