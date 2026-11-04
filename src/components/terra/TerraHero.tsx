import aerialImg from "@/assets/terra/render-aereo.webp";
import { TERRA_PROJECT } from "@/lib/terra/commercial";

export function TerraHero() {
  return (
    <section id="proyecto" className="relative scroll-mt-24">
      <div className="relative min-h-[72vh] overflow-hidden sm:min-h-[78vh]">
        <img
          src={aerialImg}
          alt="Render aéreo ilustrativo de TERRA Etapa I, con los lotes, las vías proyectadas y el entorno de Popayán"
          className="absolute inset-0 h-full w-full object-cover object-[62%_center]"
          width={1729}
          height={910}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/75 via-brand-navy/25 to-transparent" />
        <div className="relative container-tf flex min-h-[72vh] items-end pb-10 pt-28 text-white sm:min-h-[78vh] sm:pb-14">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
              TERRA · Etapa I
            </p>
            <h1 className="mt-3 font-display text-[2.1rem] font-bold leading-[1.08] sm:text-5xl">
              Un lugar para construir tu historia
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
              20 hectáreas en el km 1 vía Popayán–Santa Rosa. Lotes residenciales, entorno natural y
              una zona comercial proyectada.
            </p>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.14em] text-white/65">Extensión</dt>
                <dd className="mt-1 font-semibold">{TERRA_PROJECT.hectares} ha</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.14em] text-white/65">Ubicación</dt>
                <dd className="mt-1 font-semibold">Km 1</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.14em] text-white/65">Etapa</dt>
                <dd className="mt-1 font-semibold">Lotes I</dd>
              </div>
            </dl>
            <p className="mt-5 text-xs uppercase tracking-[0.14em] text-white/70">
              Render ilustrativo
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
