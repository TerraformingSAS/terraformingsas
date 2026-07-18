import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

const SECTORS = [
  {
    title: "Entidades públicas",
    desc: "Soluciones para municipios, gobernaciones y entidades estatales.",
    icon: <path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6M9 12h.01M15 12h.01" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: "Constructoras",
    desc: "Apoyo estratégico para la ejecución de obras y componentes especializados.",
    icon: <path d="M2 21h20M4 21V9l8-5 8 5v12M9 15h6M9 11h6" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: "Desarrolladores inmobiliarios",
    desc: "Urbanización, adecuación y construcción de infraestructura para nuevos desarrollos.",
    icon: <path d="M3 20h18M5 20V8l7-4 7 4v12M9 12h.01M15 12h.01M9 16h6" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: "Empresas privadas",
    desc: "Ejecución de obras civiles e infraestructura empresarial.",
    icon: <path d="M4 21V7l6-3 6 3v14M4 21h16M14 21v-6h6v6M8 11h2M8 15h2" strokeLinecap="round" strokeLinejoin="round" />,
  },
];

export function Sectors() {
  return (
    <section id="sectores" className="py-24 sm:py-32 bg-white">
      <div className="container-tf">
        <Reveal>
          <SectionHeader
            eyebrow="Sectores y clientes"
            title="Infraestructura para diferentes sectores"
            align="center"
          />
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SECTORS.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <div className="h-full rounded-xl border border-border p-8 bg-white text-center transition-all hover:border-brand-orange/50 hover:shadow-lg">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-navy text-white">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    {s.icon}
                  </svg>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-brand-navy">{s.title}</h3>
                <p className="mt-2 text-sm text-brand-dark/75 leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}