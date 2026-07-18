import { Reveal } from "./Reveal";

const ITEMS = [
  { t: "Cumplimiento", d: "Compromiso con los tiempos, alcances y calidad pactados." },
  { t: "Planeación técnica", d: "Diseño detallado y programación para cada proyecto." },
  { t: "Seguridad en obra", d: "Cultura de prevención y buenas prácticas en el sitio." },
  { t: "Gestión integral", d: "Coordinación de recursos, personal, procesos y control." },
  { t: "Adaptabilidad", d: "Capacidad de atender proyectos públicos y privados." },
  { t: "Herramientas digitales", d: "Información de proyectos apoyada en tecnología." },
  { t: "Calidad y sostenibilidad", d: "Enfoque en durabilidad y respeto por el entorno." },
];

export function Differentials() {
  return (
    <section id="diferenciales" className="relative py-24 sm:py-32 bg-brand-navy text-white overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-green/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-brand-orange/10 blur-3xl" />

      <div className="relative container-tf">
        <Reveal>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-brand-orange">
              <span className="h-px w-8 bg-brand-orange" />
              Diferenciales
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Lo que nos <span className="text-brand-green">distingue</span>
            </h2>
            <p className="mt-5 text-white/75 text-base sm:text-lg leading-relaxed">
              Nuestra propuesta se apoya en principios que fortalecen la
              relación con clientes públicos, privados y aliados estratégicos.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it, i) => (
            <Reveal key={it.t} delay={i * 60}>
              <div className="group relative rounded-xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur transition-all hover:bg-white/[0.06] hover:border-brand-orange/40">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl font-bold text-brand-orange/80 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="h-px flex-1 bg-white/15" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{it.t}</h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{it.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}