import mapaColombiaCali from "@/assets/mapa_colombia_cali.svg";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

export function Coverage() {
  return (
    <section id="cobertura" className="py-24 sm:py-32 bg-brand-gray">
      <div className="container-tf grid gap-12 lg:grid-cols-2 items-center">
        <Reveal>
          <SectionHeader
            eyebrow="Cobertura"
            title="Capacidad para atender proyectos en Colombia"
            intro="Nuestra operación está ubicada en Cali, Valle del Cauca, con capacidad para atender proyectos en diferentes regiones del territorio nacional."
          />
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
            <div className="p-5 rounded-lg bg-white border border-border">
              <div className="text-[11px] font-semibold tracking-widest uppercase text-brand-green">Sede</div>
              <div className="mt-1 text-lg font-semibold text-brand-navy">Cali</div>
              <div className="text-sm text-brand-dark/70">Valle del Cauca</div>
            </div>
            <div className="p-5 rounded-lg bg-brand-navy text-white">
              <div className="text-[11px] font-semibold tracking-widest uppercase text-brand-orange">Alcance</div>
              <div className="mt-1 text-lg font-semibold">Nacional</div>
              <div className="text-sm text-white/70">Colombia</div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <ColombiaMap />
        </Reveal>
      </div>
    </section>
  );
}

function ColombiaMap() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <img src={mapaColombiaCali} alt="Mapa de Colombia" className="w-full h-auto" loading="lazy" />

      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <g stroke="#5F8D4E" strokeWidth="0.5" strokeDasharray="1.6 1.8" fill="none" opacity="0.75">
          <line x1="40" y1="64" x2="51" y2="34" />
          <line x1="40" y1="64" x2="69" y2="63" />
          <line x1="40" y1="64" x2="28" y2="47" />
        </g>

        <g fill="#5F8D4E">
          <circle cx="51" cy="34" r="1.2" />
          <circle cx="69" cy="63" r="1.2" />
          <circle cx="28" cy="47" r="1.2" />
        </g>

        <g>
          <circle cx="40" cy="64" r="5" fill="#F7941D" opacity="0.25">
            <animate attributeName="r" values="3.2;6.2;3.2" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.35;0.08;0.35" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="40" cy="64" r="1.7" fill="#F7941D" />
          <circle cx="40" cy="64" r="0.65" fill="#ffffff" />
        </g>
      </svg>

      <div className="absolute left-[40%] top-[64%] pointer-events-none">
        <div className="absolute left-3 top-0.5 h-px w-20 bg-brand-orange/80" />
        <div className="absolute left-24 -top-4 whitespace-nowrap">
          <p className="text-base font-bold text-brand-navy leading-none">Cali</p>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-brand-green leading-none mt-1">
            VALLE DEL CAUCA
          </p>
        </div>
      </div>
    </div>
  );
}
