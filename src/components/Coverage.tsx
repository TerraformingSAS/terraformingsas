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
    <div className="relative aspect-square max-w-lg mx-auto">
      <svg viewBox="0 0 500 550" className="w-full h-full">
        <defs>
          <linearGradient id="mapg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0E2A47" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0E2A47" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {/* Simplified Colombia silhouette */}
        <path
          d="M250 40 C310 45 355 80 380 130 C405 170 415 210 400 250 C420 285 440 320 425 360 C405 405 370 430 335 445 C310 480 285 510 250 510 C215 505 195 475 180 445 C150 435 120 415 105 385 C85 350 90 310 105 275 C90 240 100 195 130 165 C155 130 175 95 210 65 C225 50 235 42 250 40 Z"
          fill="url(#mapg)"
          stroke="#5F8D4E"
          strokeWidth="1.2"
          opacity="0.9"
        />
        {/* Cali highlight (approx left-center-south) */}
        <g>
          <circle cx="175" cy="360" r="30" fill="#F7941D" opacity="0.15">
            <animate attributeName="r" values="20;40;20" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="175" cy="360" r="8" fill="#F7941D" />
          <circle cx="175" cy="360" r="3" fill="#fff" />
          <line x1="175" y1="360" x2="235" y2="330" stroke="#F7941D" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
          <text x="240" y="335" fill="#0E2A47" fontSize="16" fontWeight="700" fontFamily="Montserrat">Cali</text>
          <text x="240" y="352" fill="#5F8D4E" fontSize="10" fontWeight="600" letterSpacing="1">
            VALLE DEL CAUCA
          </text>
        </g>
        {/* Faint route lines to other regions */}
        <g stroke="#5F8D4E" strokeWidth="1" strokeDasharray="2 5" fill="none" opacity="0.6">
          <path d="M175 360 Q220 250 260 140" />
          <path d="M175 360 Q260 380 340 400" />
          <path d="M175 360 Q140 300 130 200" />
        </g>
        <g fill="#5F8D4E">
          <circle cx="260" cy="140" r="3" />
          <circle cx="340" cy="400" r="3" />
          <circle cx="130" cy="200" r="3" />
          <circle cx="300" cy="250" r="3" />
        </g>
      </svg>
    </div>
  );
}