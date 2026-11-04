import wetlandImg from "@/assets/terra/humedal-natural.png";
import { Reveal } from "@/components/Reveal";
import { TerraCaption, TerraKicker } from "@/components/terra/primitives";
import { TERRA_COPY, TERRA_PROJECT } from "@/lib/terra/commercial";

export function ProjectOverview() {
  return (
    <section id="proyecto" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="container-tf grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <Reveal>
          <figure>
            <img
              src={wetlandImg}
              alt="Render ilustrativo del humedal natural previsto en TERRA"
              className="h-[380px] w-full rounded-sm object-cover sm:h-[520px]"
              width={1579}
              height={996}
              loading="lazy"
            />
            <TerraCaption>{TERRA_COPY.renderCaption} · Humedal y entorno natural</TerraCaption>
          </figure>
        </Reveal>
        <Reveal delay={80}>
          <div>
            <TerraKicker>El proyecto</TerraKicker>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-brand-navy sm:text-4xl">
              {TERRA_COPY.overviewTitle}
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-brand-dark/80">
              <p>
                TERRA es un proyecto inmobiliario de {TERRA_PROJECT.hectares} hectáreas en{" "}
                {TERRA_PROJECT.city}, impulsado por {TERRA_PROJECT.company}. Contempla lotes
                residenciales, espacios naturales, zonas verdes y una zona comercial proyectada.
              </p>
              <p>
                La Etapa I concentra la oferta actual de lotes residenciales. Puedes consultar su
                nomenclatura, área y disponibilidad en el plano interactivo.
              </p>
              <p>
                El entorno natural —con un humedal que organiza el paisaje— es parte central del
                predio. Senderos, ciclovías, parques y la zona comercial forman parte del proyecto
                futuro y se presentan como elementos proyectados, no como obras terminadas.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
