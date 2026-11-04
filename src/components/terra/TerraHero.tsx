import aerialImg from "@/assets/terra/render-encabezado.webp";
import { trackTerraEvent } from "@/lib/terra/analytics";
import { UTM_KEYS, parseUtmSearch } from "@/lib/terra/campaign";
import { TERRA_FINANCING, TERRA_PROJECT, formatCopMillions } from "@/lib/terra/commercial";
import { useEffect, useState } from "react";

function explorerHref(search: string): string {
  const utm = parseUtmSearch(search);
  const params = new URLSearchParams();
  for (const key of UTM_KEYS) {
    const value = utm[key];
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${TERRA_PROJECT.explorerPath}?${query}` : TERRA_PROJECT.explorerPath;
}

export function TerraHero() {
  const [lotsHref, setLotsHref] = useState(TERRA_PROJECT.explorerPath);
  const showOffer = TERRA_FINANCING.showPublicOffer;

  useEffect(() => {
    setLotsHref(explorerHref(window.location.search));
  }, []);

  return (
    <section id="proyecto" className="relative scroll-mt-24">
      <div className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <img
          src={aerialImg}
          alt="Render aéreo ilustrativo de TERRA Etapa I, con los lotes, las vías proyectadas y el entorno de Popayán"
          className="absolute inset-0 h-full w-full object-cover object-[68%_center] sm:object-[58%_center]"
          width={1920}
          height={687}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e2a47]/88 via-[#0e2a47]/42 to-[#0e2a47]/5" />
        <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-t from-[#0e2a47]/55 via-transparent to-[#0e2a47]/25 sm:w-3/5 sm:bg-gradient-to-r" />

        <div className="terra-hero__copy relative container-tf flex flex-1 flex-col justify-end pb-16 pt-24 text-white sm:justify-center sm:pb-20 sm:pt-28">
          <p className="terra-hero__item text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
            TERRA · Etapa I · Popayán
          </p>
          <h1 className="terra-hero__item mt-3 max-w-3xl font-display text-[2.15rem] font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            Tu propio lote en Popayán empieza aquí.
          </h1>
          <p className="terra-hero__item mt-4 max-w-xl text-sm leading-relaxed text-white/90 sm:text-lg">
            Un proyecto de 20 hectáreas para construir tus planes, rodeado de naturaleza. Km 1 vía a
            Santa Rosa.
          </p>

          {showOffer ? (
            <div className="terra-hero__item mt-6 border-l-2 border-brand-orange pl-4">
              <p className="font-display text-[1.65rem] font-bold uppercase leading-none tracking-tight text-white sm:text-4xl">
                Separa con {formatCopMillions(TERRA_FINANCING.separacionCop)}
              </p>
              <p className="mt-2 text-sm font-medium text-white/90 sm:text-base">
                Financiación del {TERRA_FINANCING.financedPercent}% · {TERRA_FINANCING.deliveryPercent}%
                a la entrega
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/70">
                Sujeto a las condiciones comerciales vigentes.
              </p>
            </div>
          ) : null}

          <div className="terra-hero__item mt-7 flex flex-col gap-3 pr-16 sm:flex-row sm:pr-0">
            <a
              href={lotsHref}
              onClick={() => trackTerraEvent("explore_lots", { location: "hero" })}
              className="inline-flex min-h-14 items-center justify-center rounded-md bg-brand-orange px-7 text-base font-semibold text-white shadow-[0_10px_24px_rgba(247,148,29,0.28)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
            >
              Explorar lotes disponibles
            </a>
            <a
              href="#contacto"
              onClick={() => trackTerraEvent("view_quote", { location: "hero" })}
              className="inline-flex min-h-14 items-center justify-center rounded-md border border-white/55 bg-white/5 px-6 text-base font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Solicitar mi cotización
            </a>
          </div>
          <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-white/65">
            Render ilustrativo
          </p>
        </div>

        <a
          href="#lotes"
          className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/75 sm:flex"
        >
          Continuar
          <span aria-hidden className="text-base leading-none">
            ↓
          </span>
        </a>
      </div>
    </section>
  );
}
