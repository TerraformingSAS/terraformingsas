import { Reveal } from "@/components/Reveal";
import { TerraKicker } from "@/components/terra/primitives";
import { TERRA_LEGAL_NOTICE_PATH } from "@/components/terra/TerraLegalNotice";
import { TERRA_PROJECT } from "@/lib/terra/commercial";

export function DeveloperInformation() {
  return (
    <section id="respaldo" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="container-tf grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal>
          <TerraKicker>Quién desarrolla TERRA</TerraKicker>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-brand-navy sm:text-4xl">
            {TERRA_PROJECT.company}
          </h2>
          <p className="mt-5 text-brand-dark/80">
            {TERRA_PROJECT.company} es la empresa responsable del proyecto TERRA. La compañía
            desarrolla soluciones de ingeniería, construcción e infraestructura, y publica aquí la
            información del proyecto en su etapa actual.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <dl className="grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-orange">
                Contacto
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-brand-dark/80">
                {TERRA_PROJECT.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
                <a
                  className="mt-2 block hover:text-brand-orange"
                  href={`mailto:${TERRA_PROJECT.emailMercadeo}`}
                >
                  {TERRA_PROJECT.emailMercadeo}
                </a>
                <a
                  className="block hover:text-brand-orange"
                  href={`tel:+${TERRA_PROJECT.phoneE164}`}
                >
                  {TERRA_PROJECT.phoneDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-orange">
                Etapa actual
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-brand-dark/80">
                El proyecto se encuentra en fase de estructuración, diseño y preventa preliminar.
                Adelanta estudios y documentos técnicos para su radicación y gestiones ante las
                autoridades competentes.
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-orange">
                Alcance proyectado
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-brand-dark/80">
                Lotes residenciales de la Etapa I, zonas verdes, humedal y una zona comercial
                proyectada. Las obras e infraestructura se ejecutarán conforme a las autorizaciones
                aplicables.
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-orange">
                Documentación y escrituración
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-brand-dark/80">
                La escrituración individual está prevista cuando el proyecto obtenga las
                autorizaciones aplicables y se perfeccionen los documentos contractuales. La
                separación en esta etapa es preliminar y reembolsable si no se logran esas
                autorizaciones.{" "}
                <a
                  className="font-semibold text-brand-navy underline underline-offset-4"
                  href={TERRA_LEGAL_NOTICE_PATH}
                >
                  Información importante
                </a>
                .
              </dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
