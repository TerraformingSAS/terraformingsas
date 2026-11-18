import { cotizadorHref, rememberLot } from "@/components/terra/landing/links";
import { trackTerraEvent } from "@/lib/terra/analytics";
import { persistFinancingPlan, readFinancingPlan, readSelectedLot } from "@/lib/terra/campaign";
import {
  TERRA_FINANCING,
  TERRA_LOT_TYPES,
  formatCop,
  formatCopMillions,
} from "@/lib/terra/commercial";
import { normalizeLotId } from "@/lib/terra/lots";
import { useEffect, useState } from "react";

const BENEFITS = [
  {
    title: "Separación publicada",
    text: `Apartas con ${formatCopMillions(TERRA_FINANCING.separacionCop)}, según las condiciones vigentes.`,
  },
  {
    title: "Alternativa 70 / 30",
    text: `Se contempla financiar el ${TERRA_FINANCING.financedPercent}% y dejar el ${TERRA_FINANCING.deliveryPercent}% para la entrega.`,
  },
  {
    title: "Plazos del cotizador",
    text: `Los planes publicados son de ${TERRA_FINANCING.plansMonths.join(", ")} meses. La cuota se confirma en el cotizador.`,
  },
] as const;

export function LandingFinance() {
  const [months, setMonths] = useState<string>(String(TERRA_FINANCING.plansMonths[0]));
  const [typeIndex, setTypeIndex] = useState(0);
  const [lotId, setLotId] = useState("");
  const type = TERRA_LOT_TYPES[typeIndex];

  useEffect(() => {
    const stored = readFinancingPlan(window.sessionStorage);
    if (TERRA_FINANCING.plansMonths.some((plan) => String(plan) === stored)) setMonths(stored);
    setLotId(normalizeLotId(readSelectedLot(window.sessionStorage)));
  }, []);

  if (!TERRA_FINANCING.showPublicOffer) return null;

  function choosePlan(value: string) {
    setMonths(value);
    persistFinancingPlan(value, window.sessionStorage);
    trackTerraEvent("select_financing_plan", { plan: `${value}_meses`, location: "landing" });
  }

  return (
    <section id="financiacion" className="scroll-mt-24 bg-white py-16 sm:py-24">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
            Financiación
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-brand-navy sm:text-5xl">
            Conoce cómo puedes pagar tu lote.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-brand-dark/75 sm:text-base">
            Esta vista resume las alternativas vigentes. El cálculo de la cuota permanece en el
            cotizador, con las reglas del lote que elijas.
          </p>
          <ul className="mt-8 space-y-4">
            {BENEFITS.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-slate-200 p-4 transition hover:border-brand-orange/50"
              >
                <p className="font-semibold text-brand-navy">{item.title}</p>
                <p className="mt-1 text-sm text-brand-dark/75">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[32px] bg-brand-navy p-5 text-white shadow-[0_24px_60px_rgba(14,42,71,0.18)] sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-brand-orange">
            Explora una referencia
          </p>
          <div
            className="mt-4 flex flex-wrap gap-2"
            role="tablist"
            aria-label="Tipologías publicadas"
          >
            {TERRA_LOT_TYPES.map((item, index) => (
              <button
                key={item.label}
                type="button"
                role="tab"
                aria-selected={index === typeIndex}
                onClick={() => setTypeIndex(index)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                  index === typeIndex
                    ? "bg-white text-brand-navy"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-6 font-display text-4xl font-bold">{formatCop(type.fromCop)}</p>
          <p className="mt-1 text-sm text-white/70">
            Precio publicado desde, para lotes de {type.label}.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {TERRA_FINANCING.plansMonths.map((plan) => {
              const value = String(plan);
              const active = months === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => choosePlan(value)}
                  className={`rounded-2xl px-2 py-4 text-center transition ${
                    active ? "bg-brand-orange text-white" : "bg-white/10 hover:bg-white/15"
                  }`}
                >
                  <span className="block font-display text-2xl font-bold">{plan}</span>
                  <span className="text-[11px] uppercase tracking-wider">meses</span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-white/65">
            Plan guardado para tu solicitud: {months} meses
            {lotId ? ` · lote ${lotId}` : ""}. La cuota no se estima aquí.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <a
              href={cotizadorHref(lotId)}
              onClick={() => {
                rememberLot(lotId);
                trackTerraEvent("view_quote", {
                  location: "financiacion_cuota",
                  plan: `${months}_meses`,
                  lot_id: lotId || undefined,
                });
              }}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-3 text-center text-sm font-semibold text-brand-navy transition hover:bg-brand-cream"
            >
              Calcula tu cuota
            </a>
            <a
              href={cotizadorHref(lotId)}
              onClick={() => {
                rememberLot(lotId);
                trackTerraEvent("view_quote", {
                  location: "financiacion_lote",
                  lot_id: lotId || undefined,
                });
              }}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-orange px-3 text-center text-sm font-semibold text-white transition hover:brightness-110"
            >
              Cotiza tu lote
            </a>
            <a
              href={cotizadorHref(lotId)}
              onClick={() => {
                rememberLot(lotId);
                trackTerraEvent("view_quote", {
                  location: "financiacion_conocer",
                  plan: `${months}_meses`,
                  lot_id: lotId || undefined,
                });
              }}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 px-3 text-center text-sm font-semibold transition hover:bg-white/10"
            >
              Conoce tu financiación
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
