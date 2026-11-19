const PHASES = [
  {
    n: "01",
    title: "Planeación y estructuración",
    detail: "Diseños, estudios, licencias y presupuesto.",
    from: 0,
    to: 10,
    tone: "orange",
  },
  {
    n: "02",
    title: "Comercialización",
    detail: "Ventas, lanzamiento y preventa por etapas.",
    from: 5,
    to: 22,
    tone: "violet",
  },
  {
    n: "03",
    title: "Infraestructura y urbanismo",
    detail: "Redes, vías, drenajes, alumbrado y zonas comunes.",
    from: 10,
    to: 32,
    tone: "navy",
  },
  {
    n: "04",
    title: "Entrega y escrituración",
    detail: "Verificación, escrituras, registro y entrega de lotes.",
    from: 27,
    to: 36,
    tone: "orange",
  },
] as const;

const MARKS = [0, 6, 12, 18, 24, 30, 36] as const;
const HORIZON = 36;

const BAR: Record<(typeof PHASES)[number]["tone"], string> = {
  orange: "bg-brand-orange text-white",
  violet: "bg-[#5b4db1] text-white",
  navy: "bg-[#3f5f8a] text-white",
};

const ACCENT: Record<(typeof PHASES)[number]["tone"], string> = {
  orange: "bg-brand-orange",
  violet: "bg-[#5b4db1]",
  navy: "bg-[#3f5f8a]",
};

function Axis() {
  return (
    <div className="relative h-7">
      <div className="absolute inset-x-0 top-2 h-px bg-brand-navy/25" />
      <div className="relative flex justify-between text-[11px] font-semibold text-brand-navy/50">
        {MARKS.map((mark) => (
          <span key={mark} className="flex w-0 flex-col items-center">
            <span className="mb-1 h-2 w-px bg-brand-navy/30" />M{String(mark).padStart(2, "0")}
          </span>
        ))}
      </div>
    </div>
  );
}

export function LandingTimeline() {
  return (
    <section id="cronograma" className="scroll-mt-24 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
          Fase · 36 meses
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight text-brand-navy sm:text-5xl">
          Cronograma general
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-brand-dark/70">
          Línea de tiempo estimada del proyecto. Sujeta a permisos, aprobaciones y condiciones
          técnicas.
        </p>

        <div className="mt-8 overflow-hidden rounded-[28px] border border-brand-navy/10 bg-[#f7f8fb]">
          <div className="hidden items-end gap-4 border-b border-brand-navy/10 px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-navy/55 md:grid md:grid-cols-[1.1fr_0.8fr_1.6fr]">
            <span>Fase</span>
            <span>Actividades clave</span>
            <span>
              Línea de tiempo · 36 meses
              <Axis />
            </span>
          </div>
          <ol>
            {PHASES.map((phase) => {
              const left = (phase.from / HORIZON) * 100;
              const width = ((phase.to - phase.from) / HORIZON) * 100;
              return (
                <li
                  key={phase.n}
                  className="grid gap-3 border-t border-brand-navy/10 px-5 py-5 md:grid-cols-[1.1fr_0.8fr_1.6fr] md:items-center md:px-6"
                >
                  <div className="flex gap-3">
                    <span className={`mt-1 h-10 w-1.5 rounded-full ${ACCENT[phase.tone]}`} />
                    <div>
                      <p className="font-display text-sm font-bold text-brand-orange">{phase.n}</p>
                      <h3 className="font-display text-lg font-bold uppercase leading-tight text-brand-navy">
                        {phase.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-brand-dark/70">{phase.detail}</p>
                  <div className="relative h-10">
                    <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-brand-navy/10" />
                    <span
                      className={`absolute top-1/2 flex h-8 -translate-y-1/2 items-center justify-center rounded-full px-3 text-[11px] font-bold tracking-wide ${BAR[phase.tone]}`}
                      style={{ left: `${left}%`, width: `${Math.max(width, 14)}%` }}
                    >
                      M{String(phase.from).padStart(2, "0")} — M{String(phase.to).padStart(2, "0")}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
