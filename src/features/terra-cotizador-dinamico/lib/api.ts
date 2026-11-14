import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../terra-cotizador/lib/actividad";
import { irAlLogin, leerMotivo } from "../../terra-cotizador/lib/auth";
import type { ParametrosDinamicos } from "./parametros.ts";
import type { CondicionesDinamicas } from "./plan.ts";
import type { ClienteDinamico, CotizacionDinamica } from "./types.ts";

export async function peticionDinamica<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await apiFetch(`/api/cotizador-dinamico/${path}`, init);
  if (r.status === 401) {
    irAlLogin(await leerMotivo(r));
    throw new Error("Tu sesión terminó. Vuelve a ingresar.");
  }
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data.ok) throw new Error(data.error || "No se pudo completar la solicitud.");
  return data as T;
}

export function useParametrosDinamicos() {
  return useQuery({
    queryKey: ["parametros-dinamicos"],
    queryFn: () =>
      peticionDinamica<{ parametros: ParametrosDinamicos; admin: boolean }>("parametros"),
    staleTime: 30_000,
    retry: 1,
  });
}

export async function generarCotizacionDinamica(body: {
  loteId: string;
  valorPreventa: number;
  parametros: ParametrosDinamicos;
  cliente: ClienteDinamico;
  condiciones: CondicionesDinamicas;
}) {
  return peticionDinamica<{ cotizacion: CotizacionDinamica }>("cotizaciones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
