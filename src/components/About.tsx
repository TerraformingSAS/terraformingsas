import aboutImg from "@/assets/about.jpg";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

const PILLARS = [
  {
    title: "Planeación técnica",
    desc: "Análisis, diseño y programación rigurosa para cada proyecto.",
    icon: (
      <path d="M4 4h16v16H4z M4 9h16 M9 4v16" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "Ejecución eficiente",
    desc: "Procesos organizados con control de tiempos, costos y calidad.",
    icon: (
      <path d="M3 12l4 4L21 4 M3 20h18" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "Proyectos sostenibles",
    desc: "Compromiso con el desarrollo, la seguridad y el entorno.",
    icon: (
      <path d="M12 2C8 8 4 11 4 15a8 8 0 0016 0c0-4-4-7-8-13z" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
];

export function About() {
  return (
    <section id="nosotros" className="py-24 sm:py-32 bg-white">
      <div className="container-tf grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
        <Reveal>
          <div className="relative">
            <div className="absolute -inset-4 -z-10 bg-brand-gray rounded-lg" />
            <img
              src={aboutImg}
              alt="Ingenieros revisando planos de infraestructura"
              className="w-full h-[520px] object-cover rounded-lg shadow-lg"
              loading="lazy"
              width={1400}
              height={1200}
            />
            <div className="absolute -bottom-6 -right-6 hidden sm:block bg-brand-navy text-white p-6 rounded-lg max-w-[240px] shadow-xl">
              <div className="font-display text-2xl font-bold text-brand-orange">TF</div>
              <p className="mt-2 text-sm text-white/85 leading-snug">
                Transformamos el terreno en oportunidades.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <SectionHeader
            eyebrow="Quiénes somos"
            title={<>Ingeniería, compromiso <span className="text-brand-green">y resultados</span></>}
            intro={
              <>
                TERRA FORMING S.A.S. es una empresa colombiana dedicada al
                desarrollo de proyectos de infraestructura y construcción,
                ofreciendo soluciones integrales para entidades públicas,
                empresas privadas y desarrolladores inmobiliarios.
              </>
            }
          />
          <p className="mt-4 max-w-2xl text-base text-brand-dark/80 leading-relaxed">
            Nuestro enfoque combina planeación, ejecución eficiente y altos
            estándares de calidad para transformar ideas en proyectos
            sostenibles y duraderos.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {PILLARS.map((p) => (
              <div
                key={p.title}
                className="p-5 rounded-lg border border-border bg-white hover:border-brand-green transition-colors"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5F8D4E" strokeWidth="1.6">
                  {p.icon}
                </svg>
                <h3 className="mt-3 text-base font-semibold text-brand-navy">{p.title}</h3>
                <p className="mt-1 text-sm text-brand-dark/75 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}