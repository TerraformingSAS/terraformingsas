import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/features/terra-cotizador/lib/actividad";

export type Sesion = { email: string; nombre: string; rol: string };
export type Motivo = "vencida" | "inactividad" | "desactivado" | "salio";

export class NoAutorizado extends Error {
  override name = "NoAutorizado";
  constructor(public motivo: Motivo = "vencida") {
    super("No autorizado");
  }
}

export async function leerMotivo(r: Response): Promise<Motivo> {
  const j = (await r.json().catch(() => ({}))) as { motivo?: Motivo };
  return j.motivo ?? "vencida";
}

export async function fetchSesion(): Promise<Sesion> {
  const r = await apiFetch("/api/auth/yo");
  if (r.status === 401) throw new NoAutorizado(await leerMotivo(r));
  if (!r.ok) throw new Error(`yo ${r.status}`);
  return (await r.json()) as Sesion;
}

/** Se revisa cada minuto: si desmarcan al vendedor en la lista, sale en menos de un minuto. */
export function useSesion() {
  return useQuery({
    queryKey: ["sesion"],
    queryFn: fetchSesion,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    retry: (n, e) => !(e instanceof NoAutorizado) && n < 2,
  });
}

export function irAlLogin(motivo: Motivo) {
  if (!window.location.pathname.endsWith("/login"))
    window.location.assign(`/terra/cotizador/login?motivo=${motivo}`);
}

export function useCerrarSesion() {
  const qc = useQueryClient();
  return async (motivo: Motivo = "salio") => {
    await apiFetch("/api/auth/salir", { method: "POST" }).catch(() => undefined);
    qc.clear();
    irAlLogin(motivo);
  };
}
