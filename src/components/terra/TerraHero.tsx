import aerialImg from "@/assets/terra/render-aereo.webp";
import { TerraLeadForm } from "@/components/terra/TerraLeadForm";
import { TERRA_PROJECT } from "@/lib/terra/commercial";

export function TerraHero() {
  return (
    <section id="proyecto" className="relative scroll-mt-24 overflow-hidden">
      <img
        src={aerialImg}
        alt="Render aéreo ilustrativo de TERRA Etapa I, con el predio, las vías proyectadas y el entorno de Popayán"
        className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
        width={1729}
        height={910}
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-brand-navy/55" />
      <div className="relative container-tf grid items-start gap-8 pb-12 pt-28 text-white lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:gap-12 lg:pb-16 lg:pt-32">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
            TERRA · Etapa I
          </p>
          <h1 className="mt-3 font-display text-[2.1rem] font-bold leading-[1.08] sm:text-5xl">
            Un lugar para construir tu historia
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/90 sm:text-base">
            20 hectáreas en el km 1 vía Popayán–Santa Rosa. Lotes residenciales, entorno natural y
            una zona comercial proyectada.
          </p>
          <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
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
        <div id="contacto" className="scroll-mt-28">
          <TerraLeadForm />
        </div>
      </div>
    </section>
  );
}
