import { Link } from "@tanstack/react-router";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import vial from "@/assets/cap-vial.jpg";
import acueducto from "@/assets/cap-acueducto.jpg";
import urbanismo from "@/assets/cap-urbanismo.jpg";
import tierras from "@/assets/cap-tierras.jpg";
import espacio from "@/assets/cap-espacio.jpg";
import terraCard from "@/assets/terra/card-banner.jpg";

const CAPS = [
  {
    t: "Terra",
    img: terraCard,
    eyebrow: "Proyecto",
    href: "/terra" as const,
  },
  { t: "Infraestructura vial", img: vial, eyebrow: "Línea de trabajo" },
  { t: "Acueductos y alcantarillados", img: acueducto, eyebrow: "Línea de trabajo" },
  { t: "Urbanismo", img: urbanismo, eyebrow: "Línea de trabajo" },
  { t: "Movimiento de tierras", img: tierras, eyebrow: "Línea de trabajo" },
  { t: "Espacio público", img: espacio, eyebrow: "Línea de trabajo" },
];

export function Projects() {
  const goContact = () => document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
  return (
    <section id="proyectos" className="py-24 sm:py-32 bg-white">
      <div className="container-tf">
        <Reveal>
          <SectionHeader
            eyebrow="Capacidades"
            title="Preparados para construir los proyectos del futuro"
            intro="Nos encontramos consolidando nuestro portafolio, fortaleciendo capacidades técnicas y operativas para atender los retos de infraestructura del país."
          />
        </Reveal>

        <div className="mt-14 grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
          {CAPS.map((c, i) => {
            const card = (
              <div className="group relative overflow-hidden rounded-lg bg-brand-navy aspect-[4/5] sm:aspect-[3/4]">
                <img
                  src={c.img}
                  alt={c.t}
                  loading="lazy"
                  width={800}
                  height={1000}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <div className="text-[9px] sm:text-[10px] font-semibold tracking-[0.18em] uppercase text-brand-orange">
                    {c.eyebrow}
                  </div>
                  <h3 className="mt-1 text-sm sm:text-base font-semibold text-white leading-snug">{c.t}</h3>
                </div>
              </div>
            );

            return (
              <Reveal key={c.t} delay={i * 50}>
                {"href" in c && c.href ? (
                  <Link to={c.href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange rounded-lg">
                    {card}
                  </Link>
                ) : (
                  card
                )}
              </Reveal>
            );
          })}
        </div>

        <div className="mt-14 flex justify-center">
          <button
            onClick={goContact}
            className="inline-flex items-center gap-2 rounded-md border-2 border-brand-navy px-8 py-3.5 text-sm font-semibold text-brand-navy transition-all hover:bg-brand-navy hover:text-white"
          >
            Conocer nuestras capacidades
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
