import {
  TERRA_COPY,
  TERRA_PROJECT,
  TERRA_TIMELINE,
  TERRA_TIMELINE_HORIZON_MONTHS,
} from "@/lib/terra/commercial";

export function ProjectTrust() {
  return (
    <section id="desarrollo" className="scroll-mt-24 bg-white py-14 sm:py-20">
      <div className="container-tf grid gap-10 lg:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-orange">
            Quién desarrolla TERRA
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-brand-navy">
            {TERRA_PROJECT.company}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-brand-dark/80">
            Empresa responsable del proyecto, hoy en estructuración, diseño y preventa preliminar.
            La escrituración individual está prevista cuando existan las autorizaciones aplicables.
          </p>
          <p className="mt-4 text-sm text-brand-navy">
            <a className="hover:text-brand-orange" href={`mailto:${TERRA_PROJECT.emailMercadeo}`}>
              {TERRA_PROJECT.emailMercadeo}
            </a>
            <span className="mx-2 text-brand-dark/40">·</span>
            <a className="hover:text-brand-orange" href={`tel:+${TERRA_PROJECT.phoneE164}`}>
              {TERRA_PROJECT.phoneDisplay}
            </a>
          </p>
        </div>
        <div id="cronograma">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-orange">
            Cómo avanza
          </p>
          <p className="mt-3 text-sm text-brand-dark/80">
            Horizonte estimado: {TERRA_TIMELINE_HORIZON_MONTHS} meses. Etapa regulatoria inicial de
            6 a 8 meses.
          </p>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2">
            {TERRA_TIMELINE.map((phase) => (
              <li
                key={phase.id}
                className="border-l-2 border-brand-green pl-3 text-sm text-brand-navy"
              >
                {phase.title}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-brand-dark/60">{TERRA_COPY.timelineDisclaimer}</p>
        </div>
      </div>
    </section>
  );
}
