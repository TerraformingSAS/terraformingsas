import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/features/terra-cotizador/lib/actividad";
import { NoAutorizado, leerMotivo } from "@/features/terra-cotizador/lib/auth";
import {
  PARAMETROS_DEFAULT,
  itemsDesdeParametros,
  type ParametroItem,
  type ParametrosCotizador,
} from "@/features/terra-cotizador/lib/parametros";

export type LoteStatsItem = {
  codigo: string;
  loteId: string;
  idLote: string;
  clienteNombre: string;
  clienteCC: string;
  clienteEmail: string;
  vendedorNombre: string;
  vendedorEmail: string;
  porcentaje: number;
  cuotas: number;
  valorPreventa: number;
  fecha: string;
  referido: string;
};

export type LoteStats = {
  idLote: string;
  loteId: string;
  total: number;
  items: LoteStatsItem[];
};

async function ensureOk(r: Response) {
  if (r.status === 401) throw new NoAutorizado(await leerMotivo(r));
  return r;
}

export async function fetchParametros(): Promise<{
  parametros: ParametrosCotizador;
  items: ParametroItem[];
  fuente: string;
}> {
  const r = await ensureOk(await apiFetch("/api/parametros"));
  if (!r.ok) {
    return {
      parametros: PARAMETROS_DEFAULT,
      items: itemsDesdeParametros(PARAMETROS_DEFAULT),
      fuente: "defaults",
    };
  }
  const j = (await r.json()) as {
    parametros?: ParametrosCotizador;
    items?: ParametroItem[];
    fuente?: string;
  };
  return {
    parametros: j.parametros ?? PARAMETROS_DEFAULT,
    items: j.items ?? itemsDesdeParametros(PARAMETROS_DEFAULT),
    fuente: j.fuente ?? "defaults",
  };
}

export function useParametros() {
  return useQuery({
    queryKey: ["parametros"],
    queryFn: fetchParametros,
    staleTime: 60_000,
    retry: (n, e) => !(e instanceof NoAutorizado) && n < 1,
  });
}

export function useGuardarParametros() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: { clave: string; valor: string }[]) => {
      const r = await ensureOk(
        await apiFetch("/api/admin/parametros", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        }),
      );
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!r.ok || !j.ok) throw new Error(j.error || "No se pudieron guardar los parámetros.");
      return j;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["parametros"] });
    },
  });
}

export function useEstadisticas(enabled: boolean) {
  return useQuery({
    queryKey: ["admin-estadisticas"],
    enabled,
    queryFn: async () => {
      const r = await ensureOk(await apiFetch("/api/admin/estadisticas"));
      if (r.status === 403) throw new Error("forbidden");
      if (!r.ok) throw new Error("stats");
      const j = (await r.json()) as { lotes?: LoteStats[] };
      return j.lotes ?? [];
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: (n, e) => !(e instanceof NoAutorizado) && n < 1,
  });
}

export async function registrarCotizacionGenerada(body: {
  codigo: string;
  loteId: string;
  idLote: string;
  nombre: string;
  cc: string;
  email: string;
  referido: string;
  porcentaje: number;
  cuotas: number;
  valorPreventa: number;
  fecha: string;
}): Promise<void> {
  await apiFetch("/api/cotizaciones/registrar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => undefined);
}
