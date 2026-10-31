import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { fmtCOP } from "@/features/terra-cotizador/lib/lotes";
import { useEstadisticas, type LoteStats } from "@/features/terra-cotizador/lib/admin-data";
import { LoadingState } from "@/features/terra-cotizador/components/states";

export function AdminEstadisticas() {
  const q = useEstadisticas(true);
  const [abierto, setAbierto] = useState<string | null>(null);

  const total = useMemo(
    () => (q.data ?? []).reduce((acc, l) => acc + l.total, 0),
    [q.data],
  );

  return (
    <section
      aria-label="Estadísticas de cotizaciones"
      className="border-b border-border bg-white px-3 py-3 sm:px-4"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#0e2a47]">
            <BarChart3 className="size-4 text-[#f7941d]" aria-hidden="true" />
            Estadísticas · cotizaciones por lote
          </p>
          <p className="text-xs text-muted-foreground">
            {q.isPending ? "Cargando…" : `${total} cotización${total === 1 ? "" : "es"} · ${q.data?.length ?? 0} lotes`}
          </p>
        </div>

        {q.isPending ? (
          <LoadingState rows={3} />
        ) : q.isError ? (
          <p className="text-sm text-destructive">No se pudieron cargar las estadísticas.</p>
        ) : !q.data?.length ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
            Aún no hay cotizaciones registradas.
          </p>
        ) : (
          <ul className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border">
            {q.data.map((lote) => (
              <LoteFila
                key={lote.idLote}
                lote={lote}
                open={abierto === lote.idLote}
                onToggle={() => setAbierto((a) => (a === lote.idLote ? null : lote.idLote))}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function LoteFila({
  lote,
  open,
  onToggle,
}: {
  lote: LoteStats;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/60",
          open && "bg-[#fff8ef]",
        )}
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="size-4 shrink-0 text-[#f7941d]" aria-hidden="true" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
        <span className="font-semibold text-[#0e2a47]">Lote {lote.idLote}</span>
        <span className="ml-auto rounded-full bg-[#0e2a47] px-2 py-0.5 text-[11px] font-bold text-white">
          {lote.total}
        </span>
      </button>
      {open && (
        <div className="border-t border-border bg-muted/30 px-3 py-2">
          <ul className="space-y-2">
            {lote.items.map((c) => (
              <li
                key={`${c.codigo}-${c.fecha}`}
                className="rounded-md border border-border bg-white px-3 py-2 text-xs"
              >
                <p className="font-semibold text-[#0e2a47]">{c.clienteNombre}</p>
                <p className="mt-0.5 text-muted-foreground">
                  {c.clienteCC && <>CC {c.clienteCC} · </>}
                  {c.clienteEmail}
                </p>
                <p className="mt-1 text-[#263746]">
                  Generó <span className="font-medium">{c.vendedorNombre}</span>
                  {" · "}
                  {format(new Date(c.fecha), "d MMM yyyy · HH:mm", { locale: es })}
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  {c.codigo} · {c.porcentaje}% · {c.cuotas} meses · {fmtCOP(c.valorPreventa)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
