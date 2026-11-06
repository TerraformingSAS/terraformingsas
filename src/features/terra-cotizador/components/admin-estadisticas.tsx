import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { fmtCOP } from "@/features/terra-cotizador/lib/lotes";
import { useLotes } from "@/features/terra-cotizador/lib/datos";
import { useEstadisticas, type LoteStats } from "@/features/terra-cotizador/lib/admin-data";
import { LoadingState } from "@/features/terra-cotizador/components/states";
import {
  ESTADOS_REPORTE,
  FILTRO_INVENTARIO_VACIO,
  areaRegistrada,
  contarEstados,
  filtrarLotes,
  inventarioPorManzana,
  manzanasDe,
  type FiltroInventario,
} from "@/features/terra-cotizador/lib/inventario";

const areaFmt = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const horaFmt = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/** Control comercial de lotes: cifras del inventario que ya consulta el cotizador. */
export function AdminEstadisticasPage() {
  const q = useLotes();
  const [filtro, setFiltro] = useState<FiltroInventario>(FILTRO_INVENTARIO_VACIO);
  const [visto, setVisto] = useState<Date | null>(null);

  useEffect(() => {
    if (q.dataUpdatedAt) setVisto(new Date(q.dataUpdatedAt));
  }, [q.dataUpdatedAt]);

  const lotes = useMemo(() => q.data?.lotes ?? [], [q.data?.lotes]);
  const manzanas = useMemo(() => manzanasDe(lotes), [lotes]);
  const filtrados = useMemo(() => filtrarLotes(lotes, filtro), [lotes, filtro]);
  const conteo = useMemo(() => contarEstados(filtrados), [filtrados]);
  const area = useMemo(() => areaRegistrada(filtrados), [filtrados]);
  const porManzana = useMemo(() => inventarioPorManzana(filtrados), [filtrados]);
  const dona = useMemo(
    () =>
      ESTADOS_REPORTE.map((e) => ({
        name: e.label,
        key: e.key,
        value: conteo[e.key],
        color: e.color,
      })).filter((d) => d.value > 0),
    [conteo],
  );
  const etapa = lotes[0]?.etapa ? `ETAPA ${lotes[0].etapa}` : "ETAPA 01";

  async function actualizar() {
    await q.refetch();
  }

  return (
    <div className="container-tf flex w-full flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
      <section className="relative overflow-hidden rounded-2xl bg-[#0c6b52] px-5 py-6 text-white shadow-sm sm:px-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border-[28px] border-white/10"
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
              Portal cliente TERRA · {etapa}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Control comercial de lotes
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/85">
              Dashboard de inventario conectado al Excel. Vuelve a consultar el archivo al abrirlo;
              también puedes actualizar los datos desde aquí.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
            <span className="size-2 rounded-full bg-[#7dffa8]" aria-hidden="true" />
            Datos en vivo
          </span>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>
          Loaded <time dateTime={visto?.toISOString()}>{visto ? horaFmt.format(visto) : "—"}</time>
        </p>
        <button
          type="button"
          onClick={() => void actualizar()}
          disabled={q.isFetching}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 font-medium text-foreground hover:bg-muted disabled:opacity-60"
        >
          <RefreshCw
            className={cn("size-3.5", q.isFetching && "animate-spin")}
            aria-hidden="true"
          />
          Refresh
        </button>
      </div>

      <section aria-label="Inventario de lotes" className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Inventario de lotes · TERRA</h2>

        <form
          className="grid gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void actualizar();
          }}
        >
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Manzana
            <select
              value={filtro.manzana}
              onChange={(e) => setFiltro((f) => ({ ...f, manzana: e.target.value }))}
              className="h-10 rounded-md border border-input bg-background px-2 text-sm text-foreground"
            >
              <option value="">Todas</option>
              {manzanas.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Estado
            <select
              value={filtro.estado}
              onChange={(e) =>
                setFiltro((f) => ({ ...f, estado: e.target.value as FiltroInventario["estado"] }))
              }
              className="h-10 rounded-md border border-input bg-background px-2 text-sm text-foreground"
            >
              <option value="">Todos</option>
              {ESTADOS_REPORTE.map((e) => (
                <option key={e.key} value={e.key}>
                  {e.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Buscar
            <input
              value={filtro.q}
              onChange={(e) => setFiltro((f) => ({ ...f, q: e.target.value }))}
              placeholder="ID, manzana, lote…"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            />
          </label>
          <button
            type="submit"
            disabled={q.isFetching}
            className="h-10 rounded-md bg-[#0c6b52] px-4 text-sm font-semibold text-white hover:bg-[#0a5a45] disabled:opacity-60"
          >
            Actualizar datos
          </button>
        </form>

        {q.isPending ? (
          <LoadingState rows={4} />
        ) : q.isError ? (
          <p className="rounded-lg border border-destructive/30 bg-card px-3 py-6 text-sm text-destructive">
            No se pudo consultar el inventario. Revisa la conexión e intenta actualizar.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
              <Kpi label="Lotes filtrados" value={String(filtrados.length)} />
              <Kpi label="Área registrada" value={areaFmt.format(area)} hint="m²" />
              <Kpi label="Disponibles" value={String(conteo.disponible)} />
              <Kpi label="Reservados" value={String(conteo.reservado)} />
              <Kpi label="En negociación" value={String(conteo.negociacion)} />
              <Kpi label="Vendidos" value={String(conteo.vendido)} />
              <Kpi label="No disponibles" value={String(conteo.no_disponible)} />
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
              <article className="rounded-xl border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Distribución por estado</h3>
                  <span className="text-[11px] text-muted-foreground">Según filtros</span>
                </div>
                {dona.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">
                    Ningún lote coincide con los filtros.
                  </p>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dona}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="58%"
                          outerRadius="82%"
                          paddingAngle={1.5}
                          stroke="transparent"
                        >
                          {dona.map((d) => (
                            <Cell key={d.key} fill={d.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value ?? 0} lotes`, ""]} />
                        <Legend
                          verticalAlign="bottom"
                          iconType="square"
                          iconSize={10}
                          wrapperStyle={{ fontSize: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </article>

              <article className="rounded-xl border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Inventario por manzana</h3>
                  <span className="text-[11px] text-muted-foreground">Estados de lote</span>
                </div>
                {porManzana.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">
                    Ningún lote coincide con los filtros.
                  </p>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={porManzana}
                        layout="vertical"
                        margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                      >
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                        <YAxis
                          type="category"
                          dataKey="manzana"
                          width={28}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip />
                        <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                        {ESTADOS_REPORTE.map((e) => (
                          <Bar
                            key={e.key}
                            dataKey={e.key}
                            name={e.label}
                            stackId="inv"
                            fill={e.color}
                            barSize={16}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </article>
            </div>
          </>
        )}
      </section>

      <CotizacionesRegistradas />
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-[#12324a] dark:text-white">
        {value}
      </p>
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </article>
  );
}

function CotizacionesRegistradas() {
  const q = useEstadisticas(true);
  const [abierto, setAbierto] = useState<string | null>(null);
  const total = useMemo(() => (q.data ?? []).reduce((acc, l) => acc + l.total, 0), [q.data]);

  return (
    <section
      aria-label="Cotizaciones registradas"
      className="rounded-xl border border-border bg-card"
    >
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Cotizaciones registradas</h2>
        <p className="text-xs text-muted-foreground">
          {q.isPending
            ? "Cargando…"
            : `${total} cotización${total === 1 ? "" : "es"} en ${q.data?.length ?? 0} lotes`}
        </p>
      </header>
      <div className="p-3">
        {q.isPending ? (
          <LoadingState rows={3} />
        ) : q.isError ? (
          <p className="text-sm text-destructive">No se pudieron cargar las cotizaciones.</p>
        ) : !q.data?.length ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            Aún no hay cotizaciones registradas.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
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
    <li>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/60",
          open && "bg-muted/50",
        )}
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
        <span className="font-semibold">Lote {lote.idLote}</span>
        <span className="ml-auto rounded-full bg-[#0e2a47] px-2 py-0.5 text-[11px] font-bold text-white">
          {lote.total}
        </span>
      </button>
      {open && (
        <ul className="space-y-2 border-t border-border bg-muted/30 px-3 py-2">
          {lote.items.map((c) => (
            <li
              key={`${c.codigo}-${c.fecha}`}
              className="rounded-md border border-border bg-background px-3 py-2 text-xs"
            >
              <p className="font-semibold">{c.clienteNombre}</p>
              <p className="mt-0.5 text-muted-foreground">
                {c.clienteCC && <>CC {c.clienteCC} · </>}
                {c.clienteEmail}
              </p>
              <p className="mt-1">
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
      )}
    </li>
  );
}
