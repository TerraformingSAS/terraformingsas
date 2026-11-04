import { Reveal } from "@/components/Reveal";
import { TerraKicker } from "@/components/terra/primitives";
import { TERRA_COPY, TERRA_TIMELINE, TERRA_TIMELINE_HORIZON_MONTHS } from "@/lib/terra/commercial";

export function DevelopmentTimeline() {
  return (
    <section id="cronograma" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="container-tf">
        <Reveal>
          <TerraKicker>Transparencia del desarrollo</TerraKicker>
          <h2 className="mt-4 max-w-xl font-display text-3xl font-bold leading-tight text-brand-navy sm:text-4xl">
            {TERRA_COPY.timelineTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-brand-dark/80">
            Horizonte estimado de desarrollo: {TERRA_TIMELINE_HORIZON_MONTHS} meses. Las duraciones
            posteriores a la etapa regulatoria se publicarán cuando exista información validada.
          </p>
        </Reveal>

        <ol className="mt-12 hidden lg:grid lg:grid-cols-6 lg:gap-4">
          {TERRA_TIMELINE.map((phase, index) => (
            <li key={phase.id} className="relative pt-6">
              <span className="absolute left-0 right-4 top-0 h-1 bg-brand-navy/15">
                <span
                  className="block h-full bg-brand-green"
                  style={{ width: index === 0 ? "70%" : "35%" }}
                />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-orange">
                {phase.durationLabel ?? "Por validar"}
              </p>
              <h3 className="mt-2 font-display text-base font-bold text-brand-navy">
                {phase.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-dark/70">{phase.detail}</p>
            </li>
          ))}
        </ol>

        <ol className="mt-10 space-y-6 border-l border-brand-navy/15 pl-5 lg:hidden">
          {TERRA_TIMELINE.map((phase) => (
            <li key={phase.id}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-orange">
                {phase.durationLabel ?? "Por validar"}
              </p>
              <h3 className="mt-1 font-display text-lg font-bold text-brand-navy">{phase.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-brand-dark/75">{phase.detail}</p>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-sm text-brand-dark/65">{TERRA_COPY.timelineDisclaimer}</p>
      </div>
    </section>
  );
}
