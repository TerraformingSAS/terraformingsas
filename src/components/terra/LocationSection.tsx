import { Reveal } from "@/components/Reveal";
import { TerraKicker, TerraPrimaryLink, TerraSecondaryLink } from "@/components/terra/primitives";
import { TERRA_COPY, TERRA_PROJECT } from "@/lib/terra/commercial";

export function LocationSection() {
  return (
    <section id="ubicacion" className="scroll-mt-24 bg-brand-cream py-20 sm:py-28">
      <div className="container-tf grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal>
          <div>
            <TerraKicker>Ubicación</TerraKicker>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-brand-navy sm:text-4xl">
              {TERRA_COPY.locationTitle}
            </h2>
            <p className="mt-5 text-brand-dark/80">
              {TERRA_PROJECT.locationLine}. La Etapa I se conecta por el acceso señalado en el plano
              del proyecto, sobre la vía existente.
            </p>
            <figure className="mt-6 overflow-hidden bg-white">
              <img
                src="/terra/estado/ubicacion-etapa-i.webp"
                alt="Vista aérea de referencia geográfica de TERRA Etapa I entre la vía Santa Rosa y la vía a Popayán"
                className="h-auto w-full object-contain"
                width={1728}
                height={910}
                loading="lazy"
              />
              <figcaption className="px-1 py-2 text-[11px] uppercase tracking-[0.14em] text-brand-dark/55">
                Imagen real de referencia geográfica
              </figcaption>
            </figure>
            <div className="mt-6 flex flex-wrap gap-3">
              <TerraPrimaryLink
                href={TERRA_PROJECT.mapsDirections}
                target="_blank"
                rel="noopener noreferrer"
              >
                Cómo llegar con Google Maps
              </TerraPrimaryLink>
              <TerraSecondaryLink
                href={TERRA_PROJECT.mapsShare}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-navy"
              >
                Consultar ubicación
              </TerraSecondaryLink>
            </div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="overflow-hidden border border-brand-navy/10 bg-white">
            <iframe
              src={TERRA_PROJECT.mapsEmbed}
              title="Mapa de ubicación del proyecto TERRA"
              width={640}
              height={480}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="aspect-[4/3] h-auto w-full border-0"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
