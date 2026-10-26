import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, CalendarIcon, Download, FileText, RotateCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSesion } from "@/features/terra-cotizador/lib/auth";
import { toast } from "sonner";
import { PdfExportButton } from "@/features/terra-cotizador/components/pdf-export-button";
import { apiFetch } from "@/features/terra-cotizador/lib/actividad";
import { EmptyState, LoadingState } from "@/features/terra-cotizador/components/states";
import { cn } from "@/lib/utils";
import logoDark from "@/features/terra-cotizador/assets/terraforming-logo-dark.png";
import {
  ESTADOS,
  cleanCC,
  codigoCotizacion,
  describirError,
  estadoInfo,
  etapaRomana,
  fmtCOP,
  inconsistenciasExcel,
  fmtNum,
  fmtPct,
  isValidCC,
  isValidEmail,
  type Estado,
  type Lote,
} from "@/features/terra-cotizador/lib/lotes";
import { useLotes } from "@/features/terra-cotizador/lib/datos";

type Cotizacion = {
  lote: Lote;
  nombre: string;
  cc: string;
  email: string;
  vendedor: string;
  referido: string;
  cuotas: number;
  codigo: string;
  fecha: Date;
  fechaLimite: Date;
};

export function HomePage() {
  const lotesQuery = useLotes();
  const userQuery = useSesion();
  const vendedor = userQuery.data?.nombre ?? "";
  const [referido, setReferido] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [cc, setCc] = useState("");
  const [email, setEmail] = useState("");
  const [fechaLimite, setFechaLimite] = useState<Date>(() => addDays(new Date(), 8));
  const [cuotas, setCuotas] = useState("12");
  const [intentado, setIntentado] = useState(false);
  const [excelError, setExcelError] = useState("");
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);

  const lotes = useMemo(() => lotesQuery.data?.lotes ?? [], [lotesQuery.data]);
  const lote = lotes.find((l) => l.id === seleccion) ?? null;

  const errores = {
    vendedor: vendedor ? "" : "No se pudo identificar al vendedor con tu inicio de sesión.",
    lote: !lote
      ? "Selecciona un lote."
      : lote.estado !== "disponible"
        ? `El lote ${lote.idLote} está ${estadoInfo(lote.estado).label.toLowerCase()}; solo se pueden cotizar lotes disponibles.`
        : "",
    nombre: nombre.trim().length >= 3 ? "" : "Escribe el nombre del comprador.",
    cc: cc.trim() && !isValidCC(cc) ? "La cédula debe tener solo números (5 a 11 dígitos)." : "",
    email: email.trim() && !isValidEmail(email) ? "Correo con formato inválido." : "",
    contacto: !cc.trim() && !email.trim() ? "Ingresa la cédula o el correo (al menos uno)." : "",
    cuotas: /^[0-9]+$/.test(cuotas.trim()) ? "" : "Indica el número de cuotas.",
  };
  const valido = Object.values(errores).every((e) => !e);

  function generar() {
    setIntentado(true);
    if (!valido || !lote) {
      setExcelError("");
      const first = document.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      return;
    }
    const meses = Number(cuotas);
    const inconsistencias = inconsistenciasExcel(lote, meses);
    if (inconsistencias.length > 0) {
      setExcelError(inconsistencias.join(" "));
      return;
    }
    const fecha = new Date();
    const nombreLimpio = nombre.trim();
    setExcelError("");
    setCotizacion({
      lote,
      nombre: nombreLimpio,
      cc: cleanCC(cc),
      email: email.trim(),
      vendedor: vendedor.trim(),
      referido: referido.trim(),
      cuotas: meses,
      codigo: codigoCotizacion(nombreLimpio, fecha, lote.idLote, meses),
      fecha,
      fechaLimite,
    });
    window.scrollTo({ top: 0 });
  }

  function nuevaCotizacion() {
    setCotizacion(null);
    setSeleccion(null);
    setNombre("");
    setCc("");
    setEmail("");
    setReferido("");
    setCuotas("12");
    setExcelError("");
    setIntentado(false);
    window.scrollTo({ top: 0 });
  }

  if (cotizacion) {
    return <QuoteView c={cotizacion} onBack={() => setCotizacion(null)} onNew={nuevaCotizacion} />;
  }

  const showErr = (k: keyof typeof errores) => (intentado ? errores[k] : "");

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)] gap-4 px-3 pb-6 pt-4 sm:px-4 lg:grid-cols-[minmax(0,1fr)_400px] lg:pb-8">
      {/* Mapa de lotes */}
      <section
        id="trabajo"
        tabIndex={-1}
        aria-labelledby="lotes-title"
        className="min-w-0 rounded-xl border border-border bg-card p-3 outline-none sm:p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 id="lotes-title" className="text-lg font-semibold">
            Lotes · TERRA Etapa I
            {lotes.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {lotes.length} lotes
              </span>
            )}
          </h1>
          <div className="relative w-full sm:w-56">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar lote, ej. A-03"
              aria-label="Buscar lote"
              className="pl-8"
              inputMode="search"
            />
          </div>
        </div>

        <div className="mt-4">
          {lotesQuery.isPending ? (
            <LoadingState rows={6} />
          ) : lotesQuery.isError ? (
            <LotesError
              error={lotesQuery.error}
              onRetry={() => lotesQuery.refetch()}
              retrying={lotesQuery.isFetching}
            />
          ) : lotes.length === 0 ? (
            <EmptyState title="No hay lotes en la tabla de precios" />
          ) : (
            <LotMap lotes={lotes} filtro={busqueda} seleccion={seleccion} onSelect={setSeleccion} />
          )}
        </div>

        {(showErr("lote") || (lote && lote.estado !== "disponible")) && (
          <p className="mt-3 text-sm font-medium text-destructive" role="alert">
            {errores.lote}
          </p>
        )}
      </section>

      {/* Formulario */}
      <aside
        aria-label="Datos de la cotización"
        className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-[4.5rem] lg:self-start"
      >
        <LoteResumen lote={lote} />

        <fieldset className="rounded-xl border border-border bg-card p-4">
          <legend className="sr-only">Asesor</legend>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-foreground">
            Asesor
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Field id="vendedor" label="Vendedor" error={userQuery.isError ? errores.vendedor : ""}>
              <Input
                id="vendedor"
                value={userQuery.isPending ? "Identificando…" : vendedor}
                readOnly
                aria-readonly="true"
                className="cursor-default bg-muted font-medium focus-visible:ring-0"
                aria-describedby="vendedor-err"
              />
            </Field>
            <Field id="referido" label="Referenciado por (opcional)">
              <Input id="referido" value={referido} onChange={(e) => setReferido(e.target.value)} />
            </Field>
          </div>
        </fieldset>

        <fieldset className="rounded-xl border border-border bg-card p-4">
          <legend className="sr-only">Comprador</legend>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-foreground">
            Comprador
          </h2>
          <div className="grid gap-3">
            <Field id="nombre" label="Nombre completo *" error={showErr("nombre")}>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoComplete="off"
                aria-invalid={!!showErr("nombre")}
                aria-describedby="nombre-err"
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Field id="cc" label="Cédula (CC)" error={showErr("cc")}>
                <Input
                  id="cc"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  inputMode="numeric"
                  autoComplete="off"
                  aria-invalid={!!(showErr("cc") || showErr("contacto"))}
                  aria-describedby="cc-err contacto-err"
                />
              </Field>
              <Field id="email" label="Correo electrónico" error={showErr("email")}>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  inputMode="email"
                  autoComplete="off"
                  aria-invalid={!!(showErr("email") || showErr("contacto"))}
                  aria-describedby="email-err contacto-err"
                />
              </Field>
            </div>
            {showErr("contacto") && (
              <p id="contacto-err" className="text-sm font-medium text-destructive" role="alert">
                {errores.contacto}
              </p>
            )}
            <Field id="cuotas" label="Número de cuotas *" error={showErr("cuotas")}>
              <Input
                id="cuotas"
                value={cuotas}
                onChange={(e) => {
                  setCuotas(e.target.value);
                  setExcelError("");
                }}
                inputMode="numeric"
                aria-invalid={!!showErr("cuotas")}
                aria-describedby="cuotas-err"
              />
            </Field>
            <div className="grid gap-1.5">
              <Label htmlFor="fecha-limite">Separar antes del</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="fecha-limite" variant="outline" className="justify-start font-normal">
                    <CalendarIcon aria-hidden="true" />
                    {format(fechaLimite, "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={es}
                    selected={fechaLimite}
                    onSelect={(d) => d && setFechaLimite(d)}
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </fieldset>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-3 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0">
          {lote && (
            <p
              className="mb-2 flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-xs lg:hidden"
              aria-hidden="true"
            >
              <span className="font-semibold">Lote {lote.idLote}</span>
              <span className="tabular-nums">Valor {fmtCOP(lote.valorPreventa)}</span>
              <span className="tabular-nums">Sep. {fmtCOP(lote.separacion)}</span>
            </p>
          )}
          {excelError && (
            <p className="mb-2 text-sm font-medium text-destructive" role="alert">
              {excelError}
            </p>
          )}
          <Button
            size="lg"
            className="h-12 w-full text-base"
            onClick={generar}
            disabled={!!lote && lote.estado !== "disponible"}
          >
            <FileText /> Generar cotización
            {lote && <span className="hidden sm:inline"> · Lote {lote.idLote}</span>}
          </Button>
        </div>
      </aside>
    </div>
  );
}

function LotesError({
  error,
  onRetry,
  retrying,
}: {
  error: unknown;
  onRetry: () => void;
  retrying: boolean;
}) {
  useEffect(() => {
    console.error("Excel read failed", error);
  }, [error]);
  const blocked = false;
  const info = describirError(error);
  return (
    <div role="alert" className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <p className="font-semibold text-destructive">{info.titulo}</p>
      <p className="max-w-sm text-sm">{info.detalle}</p>
      {info.codigo && <p className="text-xs text-muted-foreground">Código: {info.codigo}</p>}
      {!blocked && (
        <Button variant="outline" onClick={onRetry} disabled={retrying} className="mt-2">
          <RotateCw className={retrying ? "animate-spin" : undefined} /> Reintentar
        </Button>
      )}
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-err`} className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------- Mapa de lotes por manzana ---------- */
function manzanaRows(ls: Lote[]): Lote[][] {
  const desc = [...ls].sort((x, y) => y.lote.localeCompare(x.lote, undefined, { numeric: true }));
  if (ls.length <= 7) return [desc];
  const even = desc.filter((l) => parseInt(l.lote, 10) % 2 === 0);
  const odd = desc.filter((l) => parseInt(l.lote, 10) % 2 !== 0);
  return [even, odd].filter((r) => r.length > 0);
}

function LotMap({
  lotes,
  filtro,
  seleccion,
  onSelect,
}: {
  lotes: Lote[];
  filtro: string;
  seleccion: string | null;
  onSelect: (id: string) => void;
}) {
  const q = filtro.trim().toLowerCase().replace(/\s/g, "");
  const manzanas = useMemo(() => {
    const map = new Map<string, Lote[]>();
    for (const l of lotes) {
      const k = l.manzana || "—";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(l);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [lotes]);
  const conteo = useMemo(() => {
    const c: Record<Estado, number> = {
      disponible: 0,
      reservado: 0,
      negociacion: 0,
      vendido: 0,
      no_disponible: 0,
    };
    for (const l of lotes) c[l.estado]++;
    return c;
  }, [lotes]);
  const coincide = (l: Lote) =>
    !q || `${l.idLote} ${l.id}`.toLowerCase().replace(/\s/g, "").includes(q);
  const hayCoincidencias = !q || lotes.some(coincide);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-col gap-4">
        {!hayCoincidencias && (
          <p className="text-sm font-medium" role="status">
            Ningún lote coincide con "{filtro}".
          </p>
        )}
        <div className="flex flex-wrap gap-x-6 gap-y-5" role="list" aria-label="Plano de manzanas">
          {manzanas.map(([mz, ls]) => {
            const rows = manzanaRows(ls);
            const cols = Math.max(...rows.map((r) => r.length));
            return (
              <div key={mz} role="listitem" className="w-full min-w-0 max-w-full sm:w-auto">
                <h3 className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">
                  Manzana {mz}
                </h3>
                <div className="overflow-x-auto pb-1">
                  <div
                    className="grid gap-px"
                    style={{ gridTemplateColumns: `repeat(${cols}, minmax(2.5rem, 2.9rem))` }}
                    role="group"
                    aria-label={`Lotes de la manzana ${mz}`}
                  >
                    {rows.flatMap((row, ri) =>
                      row.map((l, ci) => {
                        const sel = l.id === seleccion;
                        const info = estadoInfo(l.estado);
                        const dim = !coincide(l);
                        return (
                          <Tooltip key={l.id}>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => onSelect(l.id)}
                                aria-pressed={sel}
                                aria-label={`Lote ${l.idLote}, ${info.label}, ${fmtNum(l.area)} metros cuadrados`}
                                style={{ gridRow: ri + 1, gridColumn: ci + 1 }}
                                className={cn(
                                  "flex h-12 items-center justify-center rounded-[3px] border text-[11px] font-semibold text-[#0e2a47] transition focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-foreground",
                                  info.tile,
                                  sel &&
                                    "z-10 ring-2 ring-foreground ring-offset-2 ring-offset-background",
                                  dim ? "opacity-25" : "hover:brightness-105",
                                )}
                              >
                                {l.idLote}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Lote {l.idLote} · {info.label} · {fmtNum(l.area)} m²
                            </TooltipContent>
                          </Tooltip>
                        );
                      }),
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <ul
          className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-3 text-sm"
          aria-label="Convenciones de estado"
        >
          {ESTADOS.map((e) => (
            <li key={e.key} className="flex items-center gap-2">
              <span
                className={cn("size-3 rounded-full border border-black/10", e.dot)}
                aria-hidden="true"
              />
              {e.label}
              <span className="tabular-nums text-muted-foreground">{conteo[e.key]}</span>
            </li>
          ))}
        </ul>
      </div>
    </TooltipProvider>
  );
}

function LoteResumen({ lote }: { lote: Lote | null }) {
  if (!lote) {
    return (
      <div className="hidden rounded-xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground lg:block">
        Ningún lote seleccionado
      </div>
    );
  }
  const info = estadoInfo(lote.estado);
  return (
    <section
      aria-label="Lote seleccionado"
      className="overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-[#f7941d] bg-[#0e2a47] px-4 py-3 text-white">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/80">Lote seleccionado</p>
          <p className="text-2xl font-bold">{lote.idLote}</p>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium">
            <span className={cn("size-2 rounded-full", info.dot)} aria-hidden="true" />
            {info.label}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/80">Área</p>
          <p className="text-lg font-semibold">{fmtNum(lote.area)} m²</p>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-border border-b border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="flex items-baseline justify-between gap-3 px-4 py-2.5 sm:block sm:py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em]">Valor del lote</p>
          <p className="text-lg font-bold leading-tight tabular-nums sm:text-xl">
            {fmtCOP(lote.valorPreventa)}
          </p>
        </div>
        <div className="flex items-baseline justify-between gap-3 px-4 py-2.5 sm:block sm:py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em]">Separación</p>
          <p className="text-lg font-bold leading-tight tabular-nums text-green-800 sm:text-xl dark:text-green-400">
            {fmtCOP(lote.separacion)}
          </p>
        </div>
      </div>
      <dl className="divide-y divide-border px-4 text-[13px]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 py-2">
          <dt>Valor comercial</dt>
          <dd className="tabular-nums">{fmtCOP(lote.valorLote)}</dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 py-2">
          <dt>Descuento preventa ({fmtPct(lote.descuento)})</dt>
          <dd className="tabular-nums">− {fmtCOP(lote.valorLote - lote.valorPreventa)}</dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 py-2">
          <dt className="font-semibold">Saldo a financiar</dt>
          <dd className="font-semibold tabular-nums">{fmtCOP(lote.valorFinanciar)}</dd>
        </div>
      </dl>

      <div className="border-t border-border bg-muted/50 px-4 pb-3 pt-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em]">Cuota mensual</p>
        <dl className="mt-1 grid grid-cols-3 gap-1 text-center text-[13px] sm:gap-2 sm:text-sm">
          {[
            ["12 meses", lote.cuota12],
            ["24 meses", lote.cuota24],
            ["36 meses", lote.cuota36],
          ].map(([k, v]) => (
            <div key={k as string}>
              <dt className="text-xs">{k}</dt>
              <dd className="font-semibold tabular-nums">{fmtCOP(v as number)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

async function enviarAMercadeo(c: Cotizacion): Promise<boolean> {
  try {
    const res = await apiFetch("/api/cotizaciones/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: c.lote.id,
        nombre: c.nombre,
        cc: c.cc,
        email: c.email,
        referido: c.referido,
        cuotas: c.cuotas,
        codigo: c.codigo,
        fecha: c.fecha.toISOString(),
        fechaLimite: c.fechaLimite.toISOString(),
      }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(j.error || "No se pudo enviar la cotización a mercadeo.");
      return false;
    }
    return true;
  } catch {
    toast.error("No se pudo enviar la cotización a mercadeo.");
    return false;
  }
}

/* ---------- Cotización (documento) ---------- */
function QuoteView({ c, onBack, onNew }: { c: Cotizacion; onBack: () => void; onNew: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const fileName = `${c.codigo}.pdf`;
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-4xl flex-col gap-3 px-3 pb-10 pt-4 sm:px-4">
      <div
        id="trabajo"
        tabIndex={-1}
        className="flex flex-wrap items-center justify-between gap-2 outline-none"
      >
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft /> Editar datos
        </Button>
        <Button variant="outline" onClick={onNew}>
          Nueva cotización
        </Button>
      </div>
      <section
        aria-label="Cotización lista"
        className="flex flex-col gap-3 rounded-xl border border-border border-l-4 border-l-primary bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em]">Cotización lista</p>
          <p className="truncate text-sm">
            {c.codigo}
          </p>
          <p className="truncate text-xs text-muted-foreground">{fileName}</p>
        </div>
        <PdfExportButton
          targetRef={ref}
          fileName={fileName}
          options={{ paperSize: "letter", marginPoints: 18, scale: 2 }}
          onBeforePrint={() => enviarAMercadeo(c)}
        >
          <Download aria-hidden="true" /> Descargar PDF
        </PdfExportButton>
      </section>
      <div className="-mx-3 overflow-x-auto overscroll-x-contain border-y border-border bg-white shadow-sm sm:mx-0 sm:rounded-xl sm:border">
        <QuoteDocument ref={ref} c={c} />
      </div>
    </div>
  );
}

const INK = "text-[#0e2a47]";
const LABEL = "text-[10px] font-bold uppercase tracking-[0.14em] text-[#4b5563]";

function QuoteDocument({ c, ref }: { c: Cotizacion; ref: React.Ref<HTMLDivElement> }) {
  const l = c.lote;
  const fecha = (d: Date) => format(d, "d 'de' MMMM 'de' yyyy", { locale: es });
  const proyecto = `TERRA - Etapa ${etapaRomana(l.etapa)}`;
  const descuentoValor = l.valorLote - l.valorPreventa;
  const ccFmt = c.cc ? Number(c.cc).toLocaleString("es-CO") : "";

  return (
    <div
      ref={ref}
      className="box-border w-[190mm] max-w-[190mm] bg-white px-6 pb-4 pt-0 font-sans text-[#263746]"
      style={{ colorScheme: "light" }}
    >
      <div className="-mx-6 mb-4 flex h-1.5">
        <div className="flex-[3] bg-[#0e2a47]" />
        <div className="flex-1 bg-[#5f8d4e]" />
        <div className="w-16 bg-[#f7941d]" />
      </div>

      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <img src={logoDark} alt="Terra Forming" className="h-14 w-auto" />
        <div className="text-right">
          <span className="inline-block max-w-[280px] rounded-full bg-[#0e2a47] px-3 py-1 text-[10px] font-bold leading-snug tracking-[0.04em] text-white">
            {c.codigo}
          </span>
          <p className={cn("mt-2 text-sm font-bold", INK)}>{proyecto}</p>
          <p className="text-xs text-[#4b5563]">Fecha: {fecha(c.fecha)}</p>
          <p className="text-xs text-[#4b5563]">Válida hasta: {fecha(c.fechaLimite)}</p>
        </div>
      </div>

      {/* Cliente y lote */}
      <div className="mt-3 grid grid-cols-[1fr_auto] overflow-hidden rounded-lg border border-[#e5e7eb]">
        <div className="border-l-4 border-l-[#0e2a47] px-5 py-3">
          <p className={LABEL}>Cliente</p>
          <p className={cn("text-lg font-bold leading-tight", INK)}>{c.nombre}</p>
          <p className="mt-0.5 text-xs text-[#374151]">
            {c.cc && <>CC {ccFmt}</>}
            {c.cc && c.email && <span className="px-2 text-[#9ca3af]">|</span>}
            {c.email}
          </p>
        </div>
        <div className="flex flex-col justify-center bg-[#0e2a47] px-6 py-3 text-right text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/75">Lote</p>
          <p className="text-2xl font-extrabold leading-tight">{l.idLote}</p>
          <p className="text-xs text-white/85">{fmtNum(l.area)} m²</p>
        </div>
      </div>

      {/* Valor de inversión */}
      <p className={cn("mt-3 text-xs font-bold uppercase tracking-[0.14em]", INK)}>
        Valor de la inversión
      </p>
      <div className="mt-2 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-[#e5e7eb] px-4 py-3">
          <p className={LABEL}>Valor comercial</p>
          <p className="text-base font-semibold text-[#374151] line-through decoration-[#9ca3af]">
            {fmtCOP(l.valorLote)}
          </p>
          <p className="mt-1 text-[11px] text-[#5f8d4e]">
            Descuento preventa {fmtPct(l.descuento)}: −{fmtCOP(descuentoValor)}
          </p>
        </div>
        <div className="rounded-lg border-2 border-[#5f8d4e] bg-[#f4f7f2] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#5f8d4e]">
            Valor del lote (preventa)
          </p>
          <p className={cn("text-2xl font-extrabold leading-tight", INK)}>
            {fmtCOP(l.valorPreventa)}
          </p>
          <p className="mt-1 text-[11px] text-[#4b5563]">{fmtCOP(l.valorM2)} por m²</p>
        </div>
        <div className="rounded-lg border border-[#f6d7a8] bg-[#fff8ef] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c56a00]">
            Separación
          </p>
          <p className="text-2xl font-extrabold leading-tight text-[#0e2a47]">
            {fmtCOP(l.separacion)}
          </p>
          <p className="mt-1 text-[11px] text-[#263746]">Antes del {fecha(c.fechaLimite)}</p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between rounded-lg bg-[#0e2a47] px-5 py-2.5 text-white">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.08em]">Saldo a financiar</p>
          <p className="text-xs text-white/85">Valor del lote menos la separación</p>
        </div>
        <p className="text-2xl font-extrabold text-[#f7941d]">{fmtCOP(l.valorFinanciar)}</p>
      </div>

      {/* Financiación */}
      <p className={cn("mt-3 text-xs font-bold uppercase tracking-[0.14em]", INK)}>
        Opciones de financiación directa
      </p>
      <div className="mt-2 grid grid-cols-3 gap-3">
        {[
          { m: 12, v: l.cuota12, ipc: false },
          { m: 24, v: l.cuota24, ipc: true },
          { m: 36, v: l.cuota36, ipc: true },
        ].map((e) => (
          <div
            key={e.m}
            className={cn(
              "rounded-lg border px-4 py-3 text-center",
              e.m === c.cuotas ? "border-[#f7941d] bg-[#fff8ef]" : "border-[#e5e7eb]",
            )}
          >
            <p className={LABEL}>
              {e.m} meses{e.m === c.cuotas ? " · elegido" : ""}
            </p>
            <p className={cn("text-xl font-bold", INK)}>{fmtCOP(e.v)}</p>
            <p className="text-[11px] text-[#4b5563]">cuota mensual{e.ipc ? " *" : ""}</p>
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-[10px] text-[#4b5563]">
        * Las cuotas a 24 y 36 meses incluyen IPC y valorización.
      </p>

      {/* Especificaciones */}
      <div className="mt-3 grid grid-cols-4 gap-3 rounded-lg bg-[#f6f7f5] px-4 py-2 text-[11px]">
        <div>
          <p className={LABEL}>Proyecto</p>
          <p className={cn("font-bold", INK)}>{proyecto}</p>
        </div>
        <div>
          <p className={LABEL}>Lote</p>
          <p className={cn("font-bold", INK)}>
            {l.idLote} · Manzana {l.manzana}
          </p>
        </div>
        <div>
          <p className={LABEL}>Referencia</p>
          <p className={cn("font-bold", INK)}>{l.id}</p>
        </div>
        <div>
          <p className={LABEL}>Área total</p>
          <p className={cn("font-bold", INK)}>{fmtNum(l.area)} m²</p>
        </div>
      </div>

      {/* Condiciones */}
      <p className={cn("mt-3 text-xs font-bold uppercase tracking-[0.14em]", INK)}>
        Vigencia y condiciones
      </p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[11px] leading-snug text-[#374151]">
        <li>
          Cotización válida hasta el {fecha(c.fechaLimite)}, sujeta a disponibilidad del lote.
        </li>
        <li>
          El descuento de preventa se mantiene al confirmar la separación con el pago de{" "}
          {fmtCOP(l.separacion)}.
        </li>
        <li>El saldo a financiar corresponde al valor del lote menos la separación.</li>
        <li>
          Las opciones de financiación a 12, 24 o 36 meses están sujetas al plan de pagos acordado.
        </li>
        <li>
          Esta cotización no implica reserva del lote ni perfecciona por sí sola su compraventa.
        </li>
      </ul>

      {/* Pagos y asesor */}
      <div className="mt-3 grid grid-cols-[1.4fr_1fr] gap-3">
        <div className="rounded-lg border border-[#e5e7eb] px-5 py-3">
          <p className={LABEL}>Pagos y transferencias</p>
          <p className="mt-1 text-[11px] font-semibold text-[#1f2937]">
            TERRA FORMING SAS · NIT 9018681500
          </p>
          <p className="text-[11px] text-[#374151]">
            Banco de Bogotá · Cuenta corriente No. 256708884
          </p>
        </div>
        <div className="rounded-lg border border-[#e5e7eb] px-5 py-3">
          <p className={LABEL}>Asesor comercial</p>
          <p className="mt-1 text-[12px] font-semibold text-[#1f2937]">{c.vendedor}</p>
          {c.referido && (
            <p className="text-[11px] text-[#374151]">Referenciado por: {c.referido}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex justify-between border-t border-[#e5e7eb] pt-2 text-[10px] text-[#374151]">
        <span className="font-semibold">mercadeo@terraformings.co · 321 423 0090</span>
        <span>Calle 10 # 4-40, Of. 1001, Edificio Bolsa de Occidente · Cali</span>
      </div>
    </div>
  );
}
