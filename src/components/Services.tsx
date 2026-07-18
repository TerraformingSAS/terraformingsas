import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

const SERVICES = [
  {
    title: "Infraestructura vial",
    desc: "Diseño y construcción de vías con estándares técnicos exigentes.",
    items: ["Vías urbanas", "Vías rurales", "Pavimentos", "Placa huella", "Sardineles", "Movimiento de tierras"],
    icon: (
      <>
        <path d="M4 20l4-16M20 20l-4-16M9 12h6M8 16h8" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: "Acueductos y alcantarillados",
    desc: "Redes hidráulicas y sanitarias para desarrollo urbano y rural.",
    items: ["Redes hidráulicas", "Redes sanitarias", "Canales", "Drenajes", "Reservorios"],
    icon: (
      <>
        <path d="M12 2C8 8 5 11 5 15a7 7 0 0014 0c0-4-3-7-7-13z" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: "Urbanismo y espacio público",
    desc: "Intervención de espacios que integran ciudad, entorno y comunidad.",
    items: ["Andenes", "Separadores", "Espacio público", "Ornamentación", "Alumbrado público"],
    icon: (
      <>
        <path d="M3 21h18M6 21V9l6-4 6 4v12M10 21v-6h4v6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: "Vivienda y desarrollo urbano",
    desc: "Urbanización y adecuación de terrenos para nuevos proyectos.",
    items: ["Urbanizaciones", "Proyectos residenciales", "Parcelación de lotes", "Lotes urbanizados rurales"],
    icon: (
      <>
        <path d="M3 12l9-8 9 8M5 10v10h14V10M10 20v-6h4v6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

export function Services() {
  return (
    <section id="servicios" className="py-24 sm:py-32 bg-brand-gray">
      <div className="container-tf">
        <Reveal>
          <SectionHeader
            eyebrow="Servicios"
            title="Soluciones integrales para el desarrollo de infraestructura"
            intro="Acompañamos proyectos desde su planeación hasta su ejecución mediante soluciones adaptadas a las necesidades de cada cliente."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 90}>
              <article className="group h-full rounded-xl border border-border bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-green/40">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-brand-navy/5 group-hover:bg-brand-green/10 transition-colors">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0E2A47" strokeWidth="1.6" className="group-hover:stroke-brand-green transition-colors">
                    {s.icon}
                  </svg>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-brand-navy">{s.title}</h3>
                <p className="mt-2 text-sm text-brand-dark/75 leading-relaxed">{s.desc}</p>
                <ul className="mt-5 space-y-1.5 border-t border-border pt-4">
                  {s.items.map((it) => (
                    <li key={it} className="flex items-start gap-2 text-sm text-brand-dark/80">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-orange" />
                      {it}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}