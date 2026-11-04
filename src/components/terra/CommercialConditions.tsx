import { Reveal } from "@/components/Reveal";
import { TerraKicker, TerraPrimaryLink } from "@/components/terra/primitives";
import { trackTerraEvent } from "@/lib/terra/analytics";
import { persistFinancingPlan, readFinancingPlan } from "@/lib/terra/campaign";
import { TERRA_FINANCING, TERRA_PROJECT, formatCopMillions } from "@/lib/terra/commercial";
import { useEffect, useState } from "react";

const STEPS = [
  {
    n: "01",
    title: "Explora los lotes",
    text: "Revisa manzana, área y disponibilidad en el plano.",
  },
  { n: "02", title: "Selecciona una opción", text: "Elige el lote que se ajuste a tus planes." },
  {
    n: "03",
    title: "Solicita tu cotización",
    text: "Déjanos tus datos o escríbenos por WhatsApp.",
  },
  {
    n: "04",
    title: "Conoce separación y financiación",
    text: "Un asesor te comparte las condiciones vigentes.",
  },
] as const;

export function CommercialConditions() {
  const [plan, setPlan] = useState("");

  useEffect(() => {
    setPlan(readFinancingPlan(window.sessionStorage));
  }, []);

  if (!TERRA_FINANCING.showPublicOffer) return null;

  return (
    <section id="financiacion" className="scroll-mt-24 bg-brand-navy py-20 text-white sm:py-28">
      <div className="container-tf">
        <Reveal>
          <TerraKicker className="text-brand-orange">Esquema comercial</TerraKicker>
          <h2 className="mt-4 max-w-xl font-display text-3xl font-bold leading-tight sm:text-4xl">
            Condiciones vigentes para conocer y cotizar
          </h2>
          <p className="mt-4 max-w-2xl text-white/80">
            Las cifras de separación y financiación corresponden a los parámetros actuales del
            cotizador. Consulta tu caso particular antes de tomar una decisión.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="border-t border-brand-orange pt-5">
            <p className="font-display text-4xl font-bold sm:text-5xl">
              {formatCopMillions(TERRA_FINANCING.separacionCop).replace(" millones", "")}
            </p>
            <p className="mt-1 text-sm uppercase tracking-[0.16em] text-brand-orange">millones</p>
            <p className="mt-3 text-sm text-white/80">Separación anunciada.</p>
          </div>
          <div className="border-t border-white/20 pt-5">
            <p className="font-display text-4xl font-bold sm:text-5xl">
              {TERRA_FINANCING.financedPercent}%
            </p>
            <p className="mt-3 text-sm text-white/80">
              Porción financiable según las condiciones comerciales.
            </p>
          </div>
          <div className="border-t border-white/20 pt-5">
            <p className="font-display text-4xl font-bold sm:text-5xl">
              {TERRA_FINANCING.deliveryPercent}%
            </p>
            <p className="mt-3 text-sm text-white/80">Saldo contemplado para la entrega.</p>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <ol className="space-y-5">
            {STEPS.map((step) => (
              <li key={step.n} className="flex gap-4">
                <span className="font-display text-sm font-semibold text-brand-orange">
                  {step.n}
                </span>
                <div>
                  <p className="font-semibold">{step.title}</p>
                  <p className="mt-1 text-sm text-white/75">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div>
            <p className="text-sm font-medium text-white/80">Plazos de financiación vigentes</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TERRA_FINANCING.plansMonths.map((months) => {
                const value = `${months} meses`;
                const selected = plan === value;
                return (
                  <button
                    key={months}
                    type="button"
                    aria-pressed={selected}
                    className={`min-h-11 rounded-md border px-4 text-sm font-semibold ${
                      selected
                        ? "border-brand-orange bg-brand-orange text-white"
                        : "border-white/25 text-white hover:border-white/60"
                    }`}
                    onClick={() => {
                      setPlan(value);
                      persistFinancingPlan(value, window.sessionStorage);
                      trackTerraEvent("select_financing_plan", { plan: value, months });
                    }}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              12, 24 y 36 meses, según las reglas del cotizador. Las cuotas se calculan sobre el
              lote y el valor vigentes; no se publican montos genéricos.
            </p>
            <TerraPrimaryLink
              href={TERRA_PROJECT.explorerPath}
              className="mt-6"
              onClick={() => trackTerraEvent("view_quote", { location: "financing" })}
            >
              Cotizar mi lote
            </TerraPrimaryLink>
          </div>
        </div>
      </div>
    </section>
  );
}
