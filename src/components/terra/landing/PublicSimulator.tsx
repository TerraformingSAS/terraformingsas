import { cuotaPublica } from "@/components/terra/landing/cuota-publica";
import { TERRA_SIMULATOR_EVENT } from "@/components/terra/landing/links";
import { trackTerraEvent } from "@/lib/terra/analytics";
import { persistFinancingPlan } from "@/lib/terra/campaign";
import { TERRA_FINANCING, TERRA_LOT_TYPES, formatCop } from "@/lib/terra/commercial";
import { terraWhatsAppUrl } from "@/lib/terra/contact";
import { useEffect, useMemo, useState } from "react";

const MIN_MONTHS = 1;
const MAX_MONTHS = 36;

function clampSeparation(value: number, price: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(price, Math.max(0, Math.round(value)));
}

export function PublicSimulator() {
  const [open, setOpen] = useState(false);
  const [typeIndex, setTypeIndex] = useState(0);
  const [months, setMonths] = useState(12);
  const [separacion, setSeparacion] = useState(TERRA_FINANCING.separacionCop);

  const price = TERRA_LOT_TYPES[typeIndex].fromCop;
  const separation = clampSeparation(separacion, price);
  const percent = price > 0 ? (separation / price) * 100 : 0;

  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      trackTerraEvent("view_quote", { location: "simulador" });
    };
    window.addEventListener(TERRA_SIMULATOR_EVENT, onOpen);
    return () => window.removeEventListener(TERRA_SIMULATOR_EVENT, onOpen);
  }, []);

  const quote = useMemo(() => {
    const saldo = Math.round(price - separation);
    const financiado = Math.round(saldo * (TERRA_FINANCING.financedPercent / 100));
    const contraEntrega = saldo - financiado;
    return {
      saldo,
      financiado,
      contraEntrega,
      cuota: cuotaPublica(financiado, months),
    };
  }, [price, separation, months]);

  function setMonthsFrom(raw: number) {
    if (!Number.isFinite(raw)) return;
    setMonths(Math.min(MAX_MONTHS, Math.max(MIN_MONTHS, Math.round(raw))));
  }

  function setPercent(raw: number) {
    if (!Number.isFinite(raw)) return;
    const pct = Math.min(100, Math.max(0, raw));
    setSeparacion(Math.round((price * pct) / 100));
  }

  function confirmQuote() {
    persistFinancingPlan(`${months}_meses`, window.sessionStorage);
    trackTerraEvent("select_financing_plan", {
      plan: `${months}_meses`,
      location: "simulador_publico",
      value: quote.cuota,
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-4 z-40 inline-flex min-h-12 items-center rounded-full bg-brand-navy px-5 text-sm font-semibold text-white shadow-xl transition hover:-translate-y-0.5"
      >
        Simula tu cuota
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-end sm:justify-start sm:p-6">
          <button
            type="button"
            aria-label="Cerrar simulador"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <section
            role="dialog"
            aria-labelledby="simulador-titulo"
            className="relative max-h-[92vh] w-full max-w-[400px] overflow-y-auto rounded-3xl bg-white text-brand-navy shadow-2xl"
          >
            <header className="sticky top-0 flex items-center justify-between gap-3 bg-brand-navy px-5 py-4 text-white">
              <h2 id="simulador-titulo" className="font-display text-2xl font-bold">
                Simulador
              </h2>
              <a
                href={terraWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackTerraEvent("whatsapp_click", { location: "simulador" })}
                className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-brand-navy"
              >
                Hablar con un asesor
              </a>
            </header>

            <div className="space-y-4 px-5 py-5">
              <label className="block text-sm">
                <span className="text-brand-dark/70">Valor del lote</span>
                <select
                  value={typeIndex}
                  onChange={(event) => setTypeIndex(Number(event.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-brand-navy/15 bg-white px-3 py-3 text-base font-medium outline-none focus:border-brand-orange"
                >
                  {TERRA_LOT_TYPES.map((item, index) => (
                    <option key={item.label} value={index}>
                      {item.label} · {formatCop(item.fromCop)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-[104px_1fr] gap-2">
                <label className="block text-sm">
                  <span className="text-brand-dark/70">Separación</span>
                  <span className="mt-1.5 flex items-center rounded-xl border border-brand-navy/15 px-3 py-3 focus-within:border-brand-orange">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={Number(percent.toFixed(2))}
                      aria-label="Porcentaje de separación"
                      onChange={(event) => setPercent(Number(event.target.value))}
                      className="w-full bg-transparent font-semibold outline-none"
                    />
                    <span className="text-brand-dark/50">%</span>
                  </span>
                </label>
                <label className="block text-sm">
                  <span className="text-brand-dark/70">Valor</span>
                  <span className="mt-1.5 flex items-center gap-2 rounded-xl border border-brand-navy/15 px-3 py-3 focus-within:border-brand-orange">
                    <input
                      type="number"
                      min={0}
                      max={price}
                      step={100000}
                      value={separation}
                      aria-label="Valor de la separación"
                      onChange={(event) =>
                        setSeparacion(clampSeparation(Number(event.target.value), price))
                      }
                      className="w-full bg-transparent font-semibold outline-none"
                    />
                    <span className="text-xs font-medium text-brand-dark/45">COP</span>
                  </span>
                </label>
              </div>

              <div>
                <p className="text-sm text-brand-dark/70">
                  Saldo a financiar ({TERRA_FINANCING.financedPercent}%)
                </p>
                <p className="mt-1.5 rounded-xl border border-brand-navy/15 bg-brand-cream px-3 py-3 font-semibold">
                  {formatCop(quote.financiado)}{" "}
                  <span className="font-medium text-brand-dark/45">COP</span>
                </p>
                <p className="mt-1 text-xs text-brand-dark/60">
                  {TERRA_FINANCING.deliveryPercent}% a la entrega: {formatCop(quote.contraEntrega)}
                </p>
              </div>

              <div>
                <div className="flex items-end justify-between gap-3">
                  <p className="text-sm text-brand-dark/70">¿A cuánto tiempo?</p>
                  <label className="flex items-center gap-2 font-display text-3xl font-bold text-brand-orange">
                    <input
                      type="number"
                      min={MIN_MONTHS}
                      max={MAX_MONTHS}
                      value={months}
                      aria-label="Meses de financiación"
                      onChange={(event) => setMonthsFrom(Number(event.target.value))}
                      className="w-20 bg-transparent text-right outline-none"
                    />
                    <span className="text-base font-semibold text-brand-navy">meses</span>
                  </label>
                </div>
                <input
                  type="range"
                  min={MIN_MONTHS}
                  max={MAX_MONTHS}
                  step={1}
                  value={months}
                  aria-label="Plazo en meses"
                  onChange={(event) => setMonthsFrom(Number(event.target.value))}
                  className="mt-3 w-full accent-brand-orange"
                />
                <div className="flex justify-between text-xs text-brand-dark/50">
                  <span>{MIN_MONTHS}</span>
                  <span>Desliza o escribe el plazo</span>
                  <span>{MAX_MONTHS}</span>
                </div>
              </div>

              <p className="rounded-2xl bg-brand-cream px-4 py-3 text-center">
                <span className="block text-xs uppercase tracking-[0.14em] text-brand-dark/60">
                  Cuota estimada
                </span>
                <span className="font-display text-3xl font-bold text-brand-navy">
                  {formatCop(quote.cuota)}
                </span>
              </p>

              <button
                type="button"
                onClick={confirmQuote}
                className="w-full rounded-full bg-brand-orange py-3.5 text-base font-bold text-white transition hover:brightness-110"
              >
                Recalcular cuota
              </button>
              <p className="text-center text-[11px] leading-relaxed text-brand-dark/60">
                Es una simulación y no reemplaza la cotización de un asesor.
              </p>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
