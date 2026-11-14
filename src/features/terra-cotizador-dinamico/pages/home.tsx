import { Fragment, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLotes } from "../../terra-cotizador/lib/datos";
import { fmtCOP, fmtNum, type Lote } from "../../terra-cotizador/lib/lotes";
import { PdfExportButton } from "../../terra-cotizador/components/pdf-export-button";
import { generarCotizacionDinamica, peticionDinamica, useParametrosDinamicos } from "../lib/api";
import {
  calcularPlanDinamico,
  fechaPeriodo,
  fechaValida,
  type CondicionesDinamicas,
  type PlanDinamico,
} from "../lib/plan.ts";
import type { ParametrosDinamicos } from "../lib/parametros.ts";
import { validarCliente, type ClienteDinamico, type CotizacionDinamica } from "../lib/types.ts";
import { PlanDocument } from "../components/plan-document";
import { fechaCorta } from "../lib/formato";

type AbonoEditable = { id: string; periodo: number; valor: string; concepto: string };
function hoyBogota() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function detalleError(e: unknown) {
  return e instanceof Error ? e.message : "No se pudo completar la operación.";
}

export function CotizadorDinamicoPage() {
  const parametros = useParametrosDinamicos();
  const lotes = useLotes();
  const [idGuardado, setIdGuardado] = useState(
    () => new URLSearchParams(window.location.search).get("cotizacion") ?? "",
  );
  const guardada = useQuery({
    queryKey: ["cotizacion-dinamica", idGuardado],
    enabled: !!idGuardado,
    queryFn: () =>
      peticionDinamica<{ cotizacion: CotizacionDinamica }>(
        `cotizaciones?id=${encodeURIComponent(idGuardado)}`,
      ),
    retry: false,
  });
  const [emitida, setEmitida] = useState<CotizacionDinamica | null>(null);
  const [base, setBase] = useState<CotizacionDinamica | undefined>();
  const documento = emitida ?? guardada.data?.cotizacion;
  function editar() {
    setBase(documento);
    setEmitida(null);
    setIdGuardado("");
  }
  if (documento) return <CotizacionEmitida cotizacion={documento} onEdit={editar} />;
  const pending = parametros.isPending || lotes.isPending || (!!idGuardado && guardada.isPending);
  const error = parametros.error || lotes.error || (idGuardado ? guardada.error : null);
  if (pending)
    return (
      <div id="trabajo" role="status" className="p-8">
        Consultando lotes y condiciones…
      </div>
    );
  if (error || !parametros.data || !lotes.data)
    return (
      <div id="trabajo" className="mx-auto max-w-xl space-y-4 p-8">
        <h1 className="text-xl font-bold">No se pudo abrir el cotizador dinámico</h1>
        <p role="alert">{detalleError(error)}</p>
        <Button
          onClick={() => {
            void parametros.refetch();
            void lotes.refetch();
            if (idGuardado) void guardada.refetch();
          }}
        >
          Reintentar
        </Button>
        {idGuardado && (
          <Button variant="outline" onClick={() => setIdGuardado("")}>
            Crear otra cotización
          </Button>
        )}
      </div>
    );
  return (
    <FormularioDinamico
      key={base?.id ?? "nuevo"}
      parametros={parametros.data.parametros}
      admin={parametros.data.admin}
      lotes={lotes.data.lotes}
      base={base}
      onGenerate={setEmitida}
    />
  );
}

function FormularioDinamico({
  parametros: p,
  admin,
  lotes,
  base,
  onGenerate,
}: {
  parametros: ParametrosDinamicos;
  admin: boolean;
  lotes: Lote[];
  base?: CotizacionDinamica;
  onGenerate: (c: CotizacionDinamica) => void;
}) {
  const [loteId, setLoteId] = useState(base?.lote.id ?? "");
  const [search, setSearch] = useState("");
  const [cliente, setCliente] = useState<ClienteDinamico>(
    base?.cliente ?? { nombre: "", cc: "", email: "", referido: "" },
  );
  const [separacion, setSeparacion] = useState(
    String(base?.condiciones.separacion ?? p.separacionMinima),
  );
  const [cuota, setCuota] = useState(String(base?.condiciones.cuotaMensual ?? p.cuotaMensual));
  const [periodos, setPeriodos] = useState(String(base?.condiciones.periodos ?? p.periodos));
  const [porcentaje, setPorcentaje] = useState<70 | 100>(base?.condiciones.porcentaje ?? 100);
  const [fecha, setFecha] = useState(base?.condiciones.fechaSeparacion ?? hoyBogota());
  const [entrega, setEntrega] = useState(base?.condiciones.fechaEntrega ?? "");
  const [interesesHastaEntrega, setInteresesHastaEntrega] = useState(
    base?.condiciones.interesesHastaEntrega ?? true,
  );
  const [abonos, setAbonos] = useState<AbonoEditable[]>(
    base?.condiciones.abonos.map((a) => ({ ...a, valor: String(a.valor) })) ?? [],
  );
  const [tab, setTab] = useState("condiciones");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const lote = lotes.find((l) => l.id === loteId);
  const n = Number(periodos);
  const ultimaFecha =
    fechaValida(fecha) && Number.isInteger(n) && n > 0 && n <= 360 ? fechaPeriodo(fecha, n) : "";
  const entregaEfectiva = entrega || ultimaFecha;
  const abonosInvalidos = abonos.some(
    (a) =>
      a.valor.trim() === "" ||
      !Number.isFinite(Number(a.valor)) ||
      Number(a.valor) <= 0 ||
      Number(a.valor) > 1e12 ||
      a.periodo > n,
  );
  const condiciones: CondicionesDinamicas = {
    separacion: separacion === "" ? NaN : Number(separacion),
    cuotaMensual: cuota === "" ? NaN : Number(cuota),
    porcentaje,
    periodos: periodos === "" ? NaN : n,
    fechaSeparacion: fecha,
    fechaEntrega: entregaEfectiva,
    interesesHastaEntrega,
    abonos: abonos
      .filter(
        (a) =>
          a.periodo <= n &&
          a.valor.trim() !== "" &&
          Number.isFinite(Number(a.valor)) &&
          Number(a.valor) > 0 &&
          Number(a.valor) <= 1e12,
      )
      .map((a) => ({ ...a, valor: Number(a.valor) })),
  };
  let plan: PlanDinamico | null = null,
    planError = "";
  if (lote) {
    try {
      plan = calcularPlanDinamico(lote.valorPreventa, condiciones, p);
    } catch (e) {
      planError = detalleError(e);
    }
  }
  function add(periodo: number) {
    const id = crypto.randomUUID();
    setAbonos((actual) => [...actual, { id, periodo, valor: "", concepto: "" }]);
    window.setTimeout(() => document.getElementById(`abono-${id}`)?.focus(), 0);
  }
  function editAbono(id: string, key: "valor" | "concepto", value: string) {
    setAbonos((actual) => actual.map((a) => (a.id === id ? { ...a, [key]: value } : a)));
  }
  async function generar() {
    setError("");
    try {
      if (!lote || lote.estado !== "disponible") throw new Error("Selecciona un lote disponible.");
      validarCliente(cliente);
      if (abonosInvalidos)
        throw new Error(
          "Completa los abonos con valores positivos y revisa que estén dentro del plazo.",
        );
      if (!plan) throw new Error(planError || "Revisa las condiciones del plan.");
      setBusy(true);
      const data = await generarCotizacionDinamica({
        loteId: lote.id,
        valorPreventa: lote.valorPreventa,
        parametros: p,
        cliente,
        condiciones,
      });
      onGenerate(data.cotizacion);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(detalleError(e));
      window.setTimeout(() => errorRef.current?.focus(), 0);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      id="trabajo"
      tabIndex={-1}
      className="mx-auto w-full max-w-7xl space-y-5 px-3 py-5 sm:px-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            TERRA · Preventa
          </p>
          <h1 className="mt-1 text-2xl font-bold">Cotizador dinámico</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Define la mensualidad y proyecta el saldo a la entrega. Agrega abonos en el plan para
            comparar su efecto.
          </p>
        </div>
        {admin && (
          <Button variant="outline" asChild>
            <Link to="/terra/cotizador-dinamico/parametros">Parámetros del dinámico</Link>
          </Button>
        )}
      </header>
      {base && (
        <p className="rounded-lg border bg-card p-3 text-sm">
          Nueva versión a partir de {base.codigo}. Se usarán los precios y parámetros vigentes; la
          cotización anterior se conserva.
        </p>
      )}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto max-w-full">
          <TabsTrigger className="whitespace-normal" value="condiciones">
            1. Datos y condiciones
          </TabsTrigger>
          <TabsTrigger className="whitespace-normal" value="plan">
            2. Plan de pagos{abonos.length ? ` (${abonos.length} abonos)` : ""}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="condiciones" className="mt-4">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <section className="space-y-4 rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">Lote y comprador</h2>
              <Campo id="buscar-lote" label="Buscar lote">
                <Input
                  className="text-base"
                  id="buscar-lote"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ej. E-02"
                />
              </Campo>
              <Campo id="lote-dinamico" label="Lote">
                <select
                  id="lote-dinamico"
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-base"
                  value={loteId}
                  onChange={(e) => setLoteId(e.target.value)}
                >
                  <option value="">Selecciona un lote</option>
                  {lotes
                    .filter(
                      (l) =>
                        l.id === loteId ||
                        `${l.id} ${l.idLote}`.toLowerCase().includes(search.toLowerCase()),
                    )
                    .map((l) => (
                      <option key={l.id} value={l.id} disabled={l.estado !== "disponible"}>
                        {l.idLote} · {fmtNum(l.area)} m² · {fmtCOP(l.valorPreventa)}
                        {l.estado !== "disponible" ? ` · ${l.estado}` : ""}
                      </option>
                    ))}
                </select>
              </Campo>
              {lote && (
                <p className="rounded-lg bg-muted p-3 text-sm">
                  <strong>{lote.idLote}</strong> · {fmtNum(lote.area)} m² · Precio de preventa{" "}
                  <strong>{fmtCOP(lote.valorPreventa)}</strong>
                </p>
              )}
              {!lotes.length && (
                <p role="status" className="text-sm">
                  No hay lotes en el inventario.
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["nombre", "Nombre completo *"],
                    ["cc", "Cédula"],
                    ["email", "Correo electrónico"],
                    ["referido", "Referenciado por (opcional)"],
                  ] as const
                ).map(([key, label]) => (
                  <Campo key={key} id={`cliente-${key}`} label={label}>
                    <Input
                      className="text-base"
                      id={`cliente-${key}`}
                      type={key === "email" ? "email" : "text"}
                      inputMode={key === "cc" ? "numeric" : undefined}
                      maxLength={key === "cc" ? 11 : key === "email" ? 254 : 200}
                      value={cliente[key]}
                      onChange={(e) => setCliente({ ...cliente, [key]: e.target.value })}
                    />
                  </Campo>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Ingresa al menos cédula o correo. El asesor se identifica con la sesión.
              </p>
            </section>
            <section className="space-y-4 rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">Condiciones de pago</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo id="separacion-dinamica" label="Separación (COP)">
                  <Input
                    className="text-base"
                    id="separacion-dinamica"
                    type="number"
                    min={p.separacionMinima}
                    max={lote?.valorPreventa ?? 1e12}
                    step="1"
                    value={separacion}
                    onChange={(e) => setSeparacion(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo: {fmtCOP(p.separacionMinima)}
                  </p>
                </Campo>
                <Campo id="porcentaje-dinamico" label="Porcentaje a financiar">
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-base"
                    id="porcentaje-dinamico"
                    value={porcentaje}
                    onChange={(e) => setPorcentaje(Number(e.target.value) as 70 | 100)}
                  >
                    <option value={100}>100% del saldo</option>
                    <option value={70}>70% del saldo</option>
                  </select>
                </Campo>
                <Campo id="cuota-dinamica" label="Cuota mensual (COP)">
                  <Input
                    className="text-base"
                    id="cuota-dinamica"
                    type="number"
                    min="0"
                    max={1e12}
                    step="1"
                    value={cuota}
                    onChange={(e) => setCuota(e.target.value)}
                  />
                </Campo>
                <Campo id="periodos-dinamicos" label="Número de mensualidades">
                  <Input
                    className="text-base"
                    id="periodos-dinamicos"
                    type="number"
                    min="1"
                    max={p.maxPeriodos}
                    step="1"
                    value={periodos}
                    onChange={(e) => setPeriodos(e.target.value)}
                  />
                </Campo>
                <Campo id="fecha-separacion" label="Fecha de separación">
                  <Input
                    className="text-base"
                    id="fecha-separacion"
                    type="date"
                    min="2000-01-01"
                    max="2200-01-01"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </Campo>
                <Campo id="fecha-entrega" label="Fecha de entrega del lote">
                  <Input
                    className="text-base"
                    id="fecha-entrega"
                    type="date"
                    min={ultimaFecha}
                    value={entregaEfectiva}
                    onChange={(e) => setEntrega(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setEntrega("")}
                    className="text-xs underline focus-visible:outline-2"
                  >
                    Usar fecha de la última mensualidad
                  </button>
                </Campo>
              </div>
              <p className="text-sm">
                <strong>{fmtNum(p.tasaMensual * 100)}% mes vencido</strong> · configurable por el
                administrador. Pagos al cierre del período mensual, desde la separación.
              </p>
              {porcentaje === 70 && (
                <p className="text-sm text-muted-foreground">
                  El 30% del saldo se reserva sin intereses y se paga a la entrega. Los abonos se
                  aplican a la parte financiada.
                </p>
              )}
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 size-5 shrink-0 accent-[#0e2a47]"
                  checked={interesesHastaEntrega}
                  onChange={(e) => setInteresesHastaEntrega(e.target.checked)}
                />
                <span>
                  Si la entrega es posterior a la última mensualidad, el saldo sigue causando
                  intereses hasta la entrega. La fracción de mes usa una tasa efectiva proporcional
                  a los días del período.
                </span>
              </label>
              <Button variant="outline" type="button" onClick={() => setTab("plan")}>
                Ver y editar plan de pagos
              </Button>
            </section>
          </div>
        </TabsContent>
        <TabsContent value="plan" className="mt-4">
          {!lote ? (
            <p className="rounded-xl border bg-card p-6">
              Selecciona un lote en «Datos y condiciones» para generar el plan.
            </p>
          ) : !plan ? (
            <p role="alert" className="rounded-xl border bg-card p-6 text-destructive">
              {planError}
            </p>
          ) : (
            <section className="overflow-hidden rounded-xl border bg-card">
              <div className="space-y-2 p-4">
                <h2 className="text-lg font-semibold">Plan de pagos proyectado</h2>
                <p className="text-sm text-muted-foreground">
                  Agrega uno o varios abonos en el mes elegido. Las cifras se recalculan al editar.
                  Los abonos que superen la deuda se ajustan al saldo; no se generan saldos
                  negativos.
                </p>
                {abonosInvalidos && (
                  <p role="status" className="text-sm text-destructive">
                    Hay abonos pendientes de completar o fuera del plazo. Completa o elimina esos
                    abonos para emitir la cotización.
                  </p>
                )}
                {abonos.some((a) => a.periodo > n) && (
                  <Button
                    variant="outline"
                    onClick={() => setAbonos(abonos.filter((a) => a.periodo <= n))}
                  >
                    Eliminar abonos fuera del plazo
                  </Button>
                )}
              </div>
              <div
                className="overflow-x-auto"
                tabIndex={0}
                role="region"
                aria-label="Grilla de pagos y abonos adicionales"
              >
                <table className="w-full min-w-[1060px] text-right text-sm tabular-nums">
                  <thead className="bg-muted text-xs">
                    <tr>
                      {[
                        "Período / fecha",
                        "Saldo inicial",
                        "Interés",
                        "Cuota",
                        "Abonos aplicados",
                        "Interés capitalizado",
                        "Saldo financiado",
                        "Acción",
                      ].map((label) => (
                        <th key={label} scope="col" className="px-3 py-3 first:text-left">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <th scope="row" className="px-3 py-3 text-left">
                        0 · {fechaCorta(fecha)}
                        <span className="block text-xs font-normal">Separación</span>
                      </th>
                      <td>—</td>
                      <td>—</td>
                      <td className="px-3">{fmtCOP(plan.separacion)}</td>
                      <td>—</td>
                      <td>—</td>
                      <td className="px-3">{fmtCOP(plan.financiado)}</td>
                      <td />
                    </tr>
                    {plan.filas.map((f) => (
                      <Fragment key={f.periodo}>
                        <tr className="border-t align-top">
                          <th scope="row" className="px-3 py-3 text-left">
                            {f.periodo} · {fechaCorta(f.fecha)}
                            <span className="block text-xs font-normal text-muted-foreground">
                              {f.tipo === "espera"
                                ? "Espera de entrega"
                                : f.cuota === 0 && f.saldoInicial === 0
                                  ? "Financiación cancelada"
                                  : "Mensualidad"}
                            </span>
                          </th>
                          <td className="px-3 py-3">{fmtCOP(f.saldoInicial)}</td>
                          <td className="px-3 py-3">{fmtCOP(f.interes)}</td>
                          <td className="px-3 py-3">{fmtCOP(f.cuota)}</td>
                          <td className="px-3 py-3">
                            {fmtCOP(f.abonos)}
                            {f.abonosSolicitados > f.abonos + 0.01 && (
                              <span className="block text-xs text-muted-foreground">
                                Ajustado al saldo
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3">{fmtCOP(f.interesCapitalizado)}</td>
                          <td className="px-3 py-3 font-semibold">{fmtCOP(f.saldoFinal)}</td>
                          <td className="px-3 py-2">
                            {f.tipo === "mensualidad" && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={
                                  f.saldoInicial + f.interes - f.cuota < 0.000001 ||
                                  abonos.length >= 1000
                                }
                                onClick={() => add(f.periodo)}
                                aria-label={`Agregar abono en el mes ${f.periodo}`}
                              >
                                <Plus className="size-4" aria-hidden="true" />
                                Abono
                              </Button>
                            )}
                          </td>
                        </tr>
                        {abonos
                          .filter((a) => a.periodo === f.periodo)
                          .map((a) => (
                            <tr key={a.id} className="bg-muted/50">
                              <td className="px-3 py-3 text-left text-xs">Abono mes {a.periodo}</td>
                              <td colSpan={7} className="px-3 py-3">
                                <div className="flex flex-wrap items-end gap-3 text-left">
                                  <Campo id={`abono-${a.id}`} label="Valor adicional (COP)">
                                    <Input
                                      id={`abono-${a.id}`}
                                      className="w-44 text-base"
                                      type="number"
                                      min="1"
                                      max={1e12}
                                      step="1"
                                      value={a.valor}
                                      aria-invalid={!a.valor.trim() || Number(a.valor) <= 0}
                                      onChange={(e) => editAbono(a.id, "valor", e.target.value)}
                                    />
                                  </Campo>
                                  <Campo id={`concepto-${a.id}`} label="Concepto (opcional)">
                                    <Input
                                      id={`concepto-${a.id}`}
                                      className="w-72 text-base"
                                      maxLength={160}
                                      value={a.concepto}
                                      onChange={(e) => editAbono(a.id, "concepto", e.target.value)}
                                    />
                                  </Campo>
                                  <Button
                                    variant="outline"
                                    aria-label={`Eliminar abono ${a.concepto || "adicional"} del mes ${a.periodo}`}
                                    onClick={() => setAbonos(abonos.filter((x) => x.id !== a.id))}
                                  >
                                    <Trash2 className="size-4" aria-hidden="true" />
                                    Eliminar
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </Fragment>
                    ))}
                    <tr className="border-t bg-muted font-bold">
                      <th scope="row" className="px-3 py-4 text-left">
                        Entrega · {fechaCorta(entregaEfectiva)}
                      </th>
                      <td colSpan={5} className="px-3">
                        Pago final adicional: {fmtCOP(plan.pagoFinal)}
                        {plan.reservadoEntrega > 0 && (
                          <span className="block text-xs font-normal">
                            Incluye reserva del 30%: {fmtCOP(plan.reservadoEntrega)}
                          </span>
                        )}
                      </td>
                      <td className="px-3">Saldo total $0</td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </TabsContent>
      </Tabs>
      {planError && tab !== "plan" && (
        <p
          role="alert"
          className="rounded-lg border border-destructive p-3 text-sm text-destructive"
        >
          {planError}
        </p>
      )}
      {plan && <ResumenPlan plan={plan} periodos={n} />}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Al generar se verifican precio, disponibilidad y parámetros; se guarda una copia del plan
          para su reporte.
        </p>
        <Button onClick={() => void generar()} disabled={busy}>
          {busy ? "Validando y guardando…" : "Generar cotización y reporte"}
        </Button>
      </section>
      {error && (
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="rounded-lg border border-destructive p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function Campo({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function ResumenPlan({ plan: p, periodos }: { plan: PlanDinamico; periodos: number }) {
  return (
    <section aria-label="Resumen del plan" className="grid gap-4 lg:grid-cols-[1fr_1.35fr]">
      <div className="rounded-xl bg-[#0e2a47] p-5 text-white">
        <p className="text-sm">Pago final adicional a la entrega</p>
        <p className="mt-2 break-words text-3xl font-bold tabular-nums">{fmtCOP(p.pagoFinal)}</p>
        <p className="mt-3 text-sm text-white/85">
          Total proyectado a pagar: <strong>{fmtCOP(p.totalPagar)}</strong>
        </p>
        <p className="mt-1 text-xs text-white/75">
          Incluye separación, mensualidades, abonos y pago final. No incluye otros gastos.
        </p>
        {p.reservadoEntrega > 0 && (
          <p className="mt-3 text-xs">
            El pago final incluye {fmtCOP(p.reservadoEntrega)} del 30% reservado sin intereses.
          </p>
        )}
      </div>
      <div className="rounded-xl border bg-card p-5">
        <dl className="grid gap-x-5 gap-y-3 text-sm sm:grid-cols-2">
          {(
            [
              ["Mensualidades aplicadas", p.totalCuotas],
              ["Abonos aplicados", p.totalAbonos],
              ["Intereses totales generados", p.interesesTotales],
              ["Antes del pago final, incluida separación", p.totalAntesEntrega],
              ["Variación del saldo financiado", p.variacionSaldo],
              [
                `Cuota para cancelar lo financiado en ${periodos} meses, sin abonos`,
                p.cuotaSinPagoFinal,
              ],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-1 font-semibold tabular-nums">{fmtCOP(value)}</dd>
            </div>
          ))}
        </dl>
        {p.diferenciaPrimeraCuota < 0 && (
          <p className="mt-4 border-t pt-3 text-sm font-medium">
            La mensualidad no cubre los intereses del primer mes. Faltan{" "}
            {fmtCOP(-p.diferenciaPrimeraCuota)}; se acumulan al saldo.
          </p>
        )}
        {p.periodoCancelacion !== null && (
          <p className="mt-4 border-t pt-3 text-sm">
            La parte financiada se cancela en el período {p.periodoCancelacion}. Las mensualidades
            posteriores se ajustan a $0.
            {p.reservadoEntrega > 0 && " El 30% reservado se mantiene hasta la entrega."}
          </p>
        )}
      </div>
    </section>
  );
}

function CotizacionEmitida({
  cotizacion: c,
  onEdit,
}: {
  cotizacion: CotizacionDinamica;
  onEdit: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false),
    [sent, setSent] = useState(false),
    [error, setError] = useState("");
  async function enviar() {
    setSending(true);
    setError("");
    try {
      await peticionDinamica("enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id }),
      });
      setSent(true);
    } catch (e) {
      setError(detalleError(e));
    } finally {
      setSending(false);
    }
  }
  return (
    <div
      id="trabajo"
      tabIndex={-1}
      className="mx-auto w-full max-w-4xl space-y-4 px-3 py-6 sm:px-5"
    >
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Cotización guardada
        </p>
        <h1 className="mt-1 break-words text-xl font-bold">{c.codigo}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          El reporte conserva las condiciones y los abonos usados al generar.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onEdit}>
          Editar como nueva
        </Button>
        <PdfExportButton targetRef={ref} fileName={`${c.codigo}.pdf`}>
          Imprimir / guardar PDF
        </PdfExportButton>
        <Button variant="outline" disabled={sending || sent} onClick={() => void enviar()}>
          {sending ? "Enviando…" : sent ? "Enviada a mercadeo" : "Enviar a mercadeo"}
        </Button>
        <a
          className="inline-flex items-center px-2 text-sm underline"
          href={`/terra/cotizador-dinamico?cotizacion=${encodeURIComponent(c.id)}`}
        >
          Enlace a cotización guardada
        </a>
      </div>
      {sent && (
        <p role="status" className="text-sm">
          Cotización enviada a {c.comercial.emailMercadeo}.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border shadow-sm">
        <div className="min-w-[700px]">
          <PlanDocument ref={ref} cotizacion={c} />
        </div>
      </div>
    </div>
  );
}
