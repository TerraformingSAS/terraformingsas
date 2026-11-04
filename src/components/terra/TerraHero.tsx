import aerialImg from "@/assets/terra/section-aerial.jpg";
import {
  TerraCaption,
  TerraKicker,
  TerraPrimaryLink,
  TerraSecondaryLink,
} from "@/components/terra/primitives";
import { Reveal } from "@/components/Reveal";
import {
  TERRA_COPY,
  TERRA_FINANCING,
  TERRA_PROJECT,
  formatCopMillions,
} from "@/lib/terra/commercial";

export function TerraHero() {
  return (
    <section id="inicio" className="relative min-h-[100svh] overflow-hidden">
      <img
        src={aerialImg}
        alt="Render aéreo ilustrativo de TERRA Etapa I en Popayán, con el predio, zonas verdes y el entorno de montaña"
        className="absolute inset-0 h-full w-full object-cover object-[68%_42%] sm:object-[center_42%]"
        width={1550}
        height={1015}
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/80 via-brand-navy/45 to-brand-navy/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 via-transparent to-brand-navy/20" />

      <div className="relative container-tf flex min-h-[100svh] flex-col justify-end pb-12 pt-28 text-white sm:pb-16 lg:justify-center lg:pt-32">
        <Reveal>
          <div className="max-w-2xl">
            <TerraKicker className="text-white/80">
              <span className="text-white/90">{TERRA_COPY.heroEyebrow}</span>
            </TerraKicker>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
              {TERRA_COPY.heroTitle}
            </p>
            <h1 className="mt-3 font-display text-[2.15rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              {TERRA_COPY.heroLead}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
              {TERRA_COPY.heroBody}
            </p>
          </div>
        </Reveal>

        <dl className="mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Extensión", value: `${TERRA_PROJECT.hectares} hectáreas` },
            { label: "Ubicación", value: TERRA_PROJECT.locationLine },
            { label: "Etapa actual", value: "Etapa I de lotes residenciales" },
          ].map((item) => (
            <div
              key={item.label}
              className="border-l border-white/25 bg-white/5 px-4 py-3 backdrop-blur-[2px]"
            >
              <dt className="text-[11px] uppercase tracking-[0.16em] text-white/70">
                {item.label}
              </dt>
              <dd className="mt-1 text-sm font-semibold leading-snug text-white">{item.value}</dd>
            </div>
          ))}
        </dl>

        {TERRA_FINANCING.showPublicOffer ? (
          <p className="mt-6 text-sm font-medium text-white">
            Separa tu lote con {formatCopMillions(TERRA_FINANCING.separacionCop)}.
          </p>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <TerraPrimaryLink href={TERRA_PROJECT.explorerPath}>
            Explorar lotes disponibles
          </TerraPrimaryLink>
          <TerraSecondaryLink
            href="#contacto"
            className="border-white/40 text-white hover:bg-white/10"
          >
            Solicitar información
          </TerraSecondaryLink>
        </div>
        <TerraCaption>
          {TERRA_COPY.renderCaption} del proyecto. La información publicada es preliminar.
        </TerraCaption>
      </div>
    </section>
  );
}
