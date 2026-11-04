import mapImg from "@/assets/terra/ubicacion-km1.webp";
import { TerraPrimaryLink, TerraSecondaryLink } from "@/components/terra/primitives";
import { TERRA_PROJECT } from "@/lib/terra/commercial";

export function LocationSection() {
  return (
    <section id="ubicacion" className="scroll-mt-24 bg-white py-12 sm:py-16">
      <div className="container-tf">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-orange">
            Ubicación
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-brand-navy sm:text-4xl">
            Km 1, vía Popayán–Santa Rosa
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-brand-dark/80">
            Acceso por la vía existente. El plano señala el predio y los referentes del entorno.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <TerraPrimaryLink
              href={TERRA_PROJECT.mapsDirections}
              target="_blank"
              rel="noopener noreferrer"
            >
              Cómo llegar
            </TerraPrimaryLink>
            <TerraSecondaryLink href="/terra/mapa">Mapa interactivo</TerraSecondaryLink>
          </div>
          <figure className="mt-6">
            <img
              src={mapImg}
              alt="Plano de ubicación de TERRA en el km 1 de la vía Popayán–Santa Rosa, con la ruta hacia Popayán"
              className="h-auto w-full rounded-2xl object-contain"
              width={1600}
              height={847}
              loading="lazy"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
