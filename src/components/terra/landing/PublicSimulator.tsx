import { TERRA_SIMULATOR_EVENT } from "@/components/terra/landing/links";
import { trackTerraEvent } from "@/lib/terra/analytics";
import { persistFinancingPlan } from "@/lib/terra/campaign";
import { TERRA_FINANCING, TERRA_LOT_TYPES, formatCop } from "@/lib/terra/commercial";
import { terraWhatsAppUrl } from "@/lib/terra/contact";
import { calcularFinanciacion, type PlanMeses } from "@/features/terra-cotizador/lib/financiacion";
import { useEffect, useMemo, useState } from "react";

const PLANS = TERRA_FINANCING.plansMonths;

export function PublicSimulator() {
  const [open, setOpen] = useState(false);
  const [typeIndex, setTypeIndex] = useState(0);
  const [planIndex, setPlanIndex] = useState(0);
  const [quote, setQuote] = useState<number | null>(null);

  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      trackTerraEvent("view_quote", { location: "simulador" });
    };
    window.addEventListener(TERRA_SIMULATOR_EVENT, onOpen);
    return () => window.removeEventListener(TERRA_SIMULATOR_EVENT, onOpen);
  }, []);

  const type = TERRA_LOT_TYPES[typeIndex];
  const months = PLANS[planIndex] as PlanMeses;
  const plan = useMemo(
    () => calcularFinanciacion(type.fromCop, TERRA_FINANCING.financedPercent, months),
    [type.fromCop, months],
  );
  const separacionPct = ((plan.separacion / plan.valorPreventa) * 100).toLocaleString("es-CO", {
    maximumFractionDigits: 2,
  });

  function calculate() {
    setQuote(plan.cuota);
    persistFinancingPlan(String(months), window.sessionStorage);
    trackTerraEvent("select_financing_plan", {
      plan: `${months}_meses`,
      location: "simulador_publico",
      value: plan.cuota,
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-4 z-40 inline-flex min-h-12 items-center rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white shadow-xl transition hover:-translate-y-0.5"
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
            className="relative w-full max-w-[380px] overflow-hidden rounded-3xl bg-white text-neutral-900 shadow-2xl"
          >
            <header className="flex items-center justify-between gap-3 bg-neutral-950 px-5 py-4 text-white">
              <h2 id="simulador-titulo" className="font-display text-2xl font-bold">
                Simulador
              </h2>
              <a
                href={terraWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackTerraEvent("whatsapp_click", { location: "simulador" })}
                className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-red-600"
              >
                Hablar con un asesor
              </a>
            </header>

            <div className="space-y-4 px-5 py-5">
              <label className="block text-sm">
                <span className="text-neutral-600">Valor del lote</span>
                <select
                  value={typeIndex}
                  onChange={(event) => {
                    setTypeIndex(Number(event.target.value));
                    setQuote(null);
                  }}
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-3 text-base font-medium outline-none focus:border-neutral-900"
                >
                  {TERRA_LOT_TYPES.map((item, index) => (
                    <option key={item.label} value={index}>
                      {item.label} · {formatCop(item.fromCop)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-[88px_1fr] gap-2">
                <div>
                  <p className="text-sm text-neutral-600">Separación</p>
                  <p className="mt-1.5 rounded-xl border border-neutral-200 px-3 py-3 text-sm font-semibold">
                    {separacionPct}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Valor</p>
                  <p className="mt-1.5 rounded-xl border border-neutral-200 px-3 py-3 text-sm font-semibold">
                    {formatCop(plan.separacion)}{" "}
                    <span className="font-medium text-neutral-400">COP</span>
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-neutral-600">
                  Saldo a financiar ({TERRA_FINANCING.financedPercent}%)
                </p>
                <p className="mt-1.5 rounded-xl border border-neutral-200 px-3 py-3 font-semibold">
                  {formatCop(plan.valorFinanciar)}{" "}
                  <span className="font-medium text-neutral-400">COP</span>
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {TERRA_FINANCING.deliveryPercent}% a la entrega:{" "}
                  {formatCop(plan.saldoContraEntrega)}
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-600">¿A cuánto tiempo?</p>
                <p className="mt-1 font-display text-3xl font-bold text-red-600">{months} meses</p>
                <input
                  type="range"
                  min={0}
                  max={PLANS.length - 1}
                  step={1}
                  value={planIndex}
                  aria-label="Plazo en meses"
                  onChange={(event) => {
                    setPlanIndex(Number(event.target.value));
                    setQuote(null);
                  }}
                  className="mt-3 w-full accent-red-600"
                />
                <div className="flex justify-between text-xs text-neutral-500">
                  {PLANS.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>

              {quote != null ? (
                <p className="rounded-2xl bg-neutral-50 px-4 py-3 text-center">
                  <span className="block text-xs uppercase tracking-[0.14em] text-neutral-500">
                    Cuota estimada
                  </span>
                  <span className="font-display text-3xl font-bold">{formatCop(quote)}</span>
                </p>
              ) : null}

              <button
                type="button"
                onClick={calculate}
                className="w-full rounded-full bg-red-600 py-3.5 text-base font-bold text-white transition hover:bg-red-700"
              >
                Calcular cuota
              </button>
              <p className="text-center text-[11px] leading-relaxed text-neutral-500">
                Referencia con los precios publicados y la misma regla de financiación del proyecto.
                No reemplaza la cotización de un asesor.
              </p>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
