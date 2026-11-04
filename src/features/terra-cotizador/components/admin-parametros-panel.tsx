import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { fmtCOP, fmtNum, type Lote } from "@/features/terra-cotizador/lib/lotes";
import {
  useGuardarParametros,
  useParametros,
  useSembrarMensajes,
} from "@/features/terra-cotizador/lib/admin-data";
import {
  parametrosDesdeItems,
  type ParametroItem,
} from "@/features/terra-cotizador/lib/parametros";
import { useLotes } from "@/features/terra-cotizador/lib/datos";
import { useAccesos, type AccesoRegistro } from "@/features/terra-cotizador/lib/admin-data";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const GRUPOS: { key: ParametroItem["grupo"]; label: string }[] = [
  { key: "calculo", label: "Cálculo" },
  { key: "tarifa", label: "Tarifa preventa" },
  { key: "mensajes", label: "Mensajes PDF" },
  { key: "pagos", label: "Pagos" },
  { key: "contacto", label: "Contacto" },
];

/** Pantalla completa de parámetros (admin). */
export function AdminParametrosPage() {
  const paramsQ = useParametros();
  const lotesQ = useLotes();
  const guardar = useGuardarParametros();
  const sembrar = useSembrarMensajes();
  const [draft, setDraft] = useState<ParametroItem[]>([]);
  const [tab, setTab] = useState<"params" | "lotes" | "accesos">("params");
  const accesosQ = useAccesos(tab === "accesos");

  useEffect(() => {
    if (paramsQ.data?.items) setDraft(paramsQ.data.items.map((i) => ({ ...i })));
  }, [paramsQ.data]);

  const dirty = useMemo(() => {
    const base = paramsQ.data?.items ?? [];
    if (base.length !== draft.length) return true;
    return draft.some((d, i) => d.valor !== base[i]?.valor);
  }, [draft, paramsQ.data]);

  function setValor(clave: string, valor: string) {
    setDraft((prev) => prev.map((i) => (i.clave === clave ? { ...i, valor } : i)));
  }

  async function onSave() {
    try {
      const parsed = parametrosDesdeItems(draft);
      if (!parsed.tarifaPreventa.length)
        throw new Error("La tarifa preventa no puede quedar vacía.");
      await guardar.mutateAsync(draft.map((i) => ({ clave: i.clave, valor: i.valor })));
      toast.success("Parámetros guardados.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudieron guardar.");
    }
  }

  return (
    <div className="container-tf flex w-full flex-1 flex-col px-4 py-6 sm:px-6">
      <header className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0e2a47] dark:text-white">
          Administrador
        </p>
        <h1 className="text-2xl font-semibold text-[#0e2a47] dark:text-white">
          Parámetros del cotizador
        </h1>
        <p className="mt-1 text-sm text-[#263746] dark:text-white/80">
          Valores editables en Upstash Redis (mensajes PDF, cálculo, pagos y contacto).
        </p>
      </header>

      <div className="mb-4 flex gap-1 border-b border-border">
        <TabBtn active={tab === "params"} onClick={() => setTab("params")}>
          Parámetros
        </TabBtn>
        <TabBtn active={tab === "lotes"} onClick={() => setTab("lotes")}>
          Valores de lotes
        </TabBtn>
        <TabBtn active={tab === "accesos"} onClick={() => setTab("accesos")}>
          Log de accesos
        </TabBtn>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-card text-card-foreground">
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {tab === "accesos" ? (
            <AccesosTabla
              accesos={accesosQ.data ?? []}
              loading={accesosQ.isPending}
              error={accesosQ.isError}
            />
          ) : tab === "params" ? (
            paramsQ.isPending ? (
              <p className="text-sm text-muted-foreground">Cargando…</p>
            ) : (
              <div className="mx-auto max-w-3xl space-y-6">
                <p className="text-xs text-muted-foreground">
                  Fuente:{" "}
                  {paramsQ.data?.fuente === "redis"
                    ? "Upstash Redis"
                    : "defaults locales (aún no hay valores guardados)"}
                </p>
                {GRUPOS.map((g) => {
                  const items = draft.filter((i) => i.grupo === g.key);
                  if (!items.length) return null;
                  return (
                    <section key={g.key}>
                      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-foreground">
                        {g.label}
                      </h2>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={item.clave} className="grid gap-1">
                            <Label htmlFor={`p-${item.clave}`} className="text-xs">
                              {item.descripcion || item.clave}
                            </Label>
                            {item.tipo === "texto" || item.clave.startsWith("msg_") ? (
                              <textarea
                                id={`p-${item.clave}`}
                                className="min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                                value={item.valor}
                                onChange={(e) => setValor(item.clave, e.target.value)}
                              />
                            ) : (
                              <Input
                                id={`p-${item.clave}`}
                                value={item.valor}
                                onChange={(e) => setValor(item.clave, e.target.value)}
                                className={item.tipo === "json" ? "font-mono text-xs" : undefined}
                              />
                            )}
                            <p className="text-[10px] text-muted-foreground">{item.clave}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )
          ) : (
            <LotesTabla lotes={lotesQ.data?.lotes ?? []} loading={lotesQ.isPending} />
          )}
        </div>

        {tab === "params" && (
          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {dirty ? "Hay cambios sin guardar" : "Sin cambios"}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={sembrar.isPending || guardar.isPending}
                onClick={() => {
                  void sembrar
                    .mutateAsync(false)
                    .then((r) => {
                      const n = r.escritos?.length ?? 0;
                      toast.success(
                        n > 0
                          ? `Mensajes sembrados en Redis (${n}).`
                          : "Los mensajes ya estaban en Redis.",
                      );
                    })
                    .catch((e) =>
                      toast.error(e instanceof Error ? e.message : "No se pudo sembrar."),
                    );
                }}
              >
                {sembrar.isPending ? "Sembrando…" : "Sembrar mensajes"}
              </Button>
              <Button onClick={() => void onSave()} disabled={!dirty || guardar.isPending}>
                {guardar.isPending ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-t-md px-3 py-2 text-sm font-medium",
        active
          ? "border border-b-0 border-border bg-card text-card-foreground"
          : "text-[#263746] hover:text-[#0e2a47] dark:text-white/75 dark:hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

function AccesosTabla({
  accesos,
  loading,
  error,
}: {
  accesos: AccesoRegistro[];
  loading: boolean;
  error: boolean;
}) {
  if (loading) return <p className="text-sm text-muted-foreground">Cargando accesos…</p>;
  if (error)
    return <p className="text-sm text-destructive">No se pudo cargar el log de accesos.</p>;
  if (!accesos.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no hay ingresos registrados. Cada inicio de sesión con código queda en esta lista.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <p className="mb-2 text-xs text-muted-foreground">
        {accesos.length} ingreso{accesos.length === 1 ? "" : "s"} · el más reciente primero. Se
        registra cuando alguien entra con el código de acceso.
      </p>
      <table className="w-full min-w-[640px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase tracking-wide text-muted-foreground">
            <th className="px-2 py-1.5">Fecha</th>
            <th className="px-2 py-1.5">Nombre</th>
            <th className="px-2 py-1.5">Correo</th>
            <th className="px-2 py-1.5">Rol</th>
          </tr>
        </thead>
        <tbody>
          {accesos.map((a, i) => (
            <tr key={`${a.fecha}-${a.email}-${i}`} className="border-b border-border/70">
              <td className="whitespace-nowrap px-2 py-1.5 tabular-nums">
                {format(new Date(a.fecha), "d MMM yyyy · HH:mm", { locale: es })}
              </td>
              <td className="px-2 py-1.5 font-semibold">{a.nombre}</td>
              <td className="px-2 py-1.5">{a.email}</td>
              <td className="px-2 py-1.5">{a.rol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LotesTabla({ lotes, loading }: { lotes: Lote[]; loading: boolean }) {
  if (loading) return <p className="text-sm text-muted-foreground">Cargando lotes…</p>;
  if (!lotes.length) return <p className="text-sm text-muted-foreground">Sin lotes.</p>;
  return (
    <div className="overflow-x-auto">
      <p className="mb-2 text-xs text-muted-foreground">
        Solo lectura · los precios se editan en el Excel de SharePoint.
      </p>
      <table className="w-full min-w-[640px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase tracking-wide text-muted-foreground">
            <th className="px-2 py-1.5">Lote</th>
            <th className="px-2 py-1.5">Área</th>
            <th className="px-2 py-1.5">Preventa</th>
            <th className="px-2 py-1.5">$/m²</th>
            <th className="px-2 py-1.5">Desc.</th>
            <th className="px-2 py-1.5">Estado</th>
          </tr>
        </thead>
        <tbody>
          {lotes.map((l) => (
            <tr key={l.id} className="border-b border-border/70">
              <td className="px-2 py-1.5 font-semibold">{l.idLote}</td>
              <td className="px-2 py-1.5 tabular-nums">{fmtNum(l.area)}</td>
              <td className="px-2 py-1.5 tabular-nums">{fmtCOP(l.valorPreventa)}</td>
              <td className="px-2 py-1.5 tabular-nums">{fmtCOP(l.valorM2)}</td>
              <td className="px-2 py-1.5 tabular-nums">{fmtNum(l.descuento * 100)}%</td>
              <td className="px-2 py-1.5 capitalize">{l.estado.replace("_", " ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
