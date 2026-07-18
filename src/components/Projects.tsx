import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import vial from "@/assets/cap-vial.jpg";
import acueducto from "@/assets/cap-acueducto.jpg";
import urbanismo from "@/assets/cap-urbanismo.jpg";
import tierras from "@/assets/cap-tierras.jpg";
import parcelacion from "@/assets/cap-parcelacion.jpg";
import espacio from "@/assets/cap-espacio.jpg";

const CAPS = [
  { t: "Infraestructura vial", img: vial },
  { t: "Acueductos y alcantarillados", img: acueducto },
  { t: "Urbanismo", img: urbanismo },
  { t: "Movimiento de tierras", img: tierras },
  { t: "Parcelación y desarrollo rural", img: parcelacion },
  { t: "Espacio público", img: espacio },
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

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CAPS.map((c, i) => (
            <Reveal key={c.t} delay={i * 70}>
              <div className="group relative overflow-hidden rounded-xl bg-brand-navy aspect-[4/3]">
                <img
                  src={c.img}
                  alt={c.t}
                  loading="lazy"
                  width={1200}
                  height={900}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-brand-orange">
                    Línea de trabajo
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-white">{c.t}</h3>
                </div>
              </div>
            </Reveal>
          ))}
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