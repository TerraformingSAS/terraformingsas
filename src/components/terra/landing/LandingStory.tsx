import mapImg from "@/assets/terra/ubicacion-km1.webp";
import aerialImg from "@/assets/terra/render-aereo.webp";
import blocksImg from "@/assets/terra/render-manzanas.webp";
import roadsImg from "@/assets/terra/render-vias.webp";
import { trackTerraEvent } from "@/lib/terra/analytics";
import {
  TERRA_PROJECT,
  TERRA_TIMELINE,
  TERRA_TIMELINE_HORIZON_MONTHS,
} from "@/lib/terra/commercial";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const GALLERY = [
  {
    title: "Entorno",
    image: aerialImg,
    alt: "Render ilustrativo del predio de TERRA y su entorno",
  },
  {
    title: "Manzanas",
    image: blocksImg,
    alt: "Render ilustrativo de manzanas proyectadas en TERRA Etapa I",
  },
  {
    title: "Vías y zonas verdes",
    image: roadsImg,
    alt: "Render ilustrativo de vías y zonas verdes de TERRA",
  },
] as const;

const BENEFITS = [
  { title: "A 1 km de Popayán", text: "Acceso por la vía existente hacia Santa Rosa." },
  { title: "20 hectáreas", text: "Espacio para vivienda y para el paisaje del predio." },
  { title: "Plano consultable", text: "Manzana, área y estado se revisan lote a lote." },
  { title: "Acompañamiento", text: "Un asesor confirma condiciones antes de decidir." },
] as const;

const FAQ = [
  {
    q: "¿Dónde queda TERRA?",
    a: `En ${TERRA_PROJECT.city}, ${TERRA_PROJECT.locationLine}.`,
  },
  {
    q: "¿La cuota se calcula en esta página?",
    a: "No. Aquí ves la estructura comercial publicada. La cuota del lote se calcula en el cotizador existente.",
  },
  {
    q: "¿Qué plazos existen?",
    a: "El cotizador contempla 12, 24 y 36 meses, con las reglas vigentes del lote seleccionado.",
  },
  {
    q: "¿En qué estado está el proyecto?",
    a: "En estructuración, diseño y preventa preliminar. El horizonte estimado es de 36 meses y la etapa regulatoria inicial de 6 a 8 meses, sujeta a permisos.",
  },
] as const;

export function LandingStory() {
  return (
    <>
      <section id="ubicacion" className="scroll-mt-24 bg-[#f6f3ee] py-16 sm:py-24">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
              Ubicación
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-brand-navy sm:text-5xl">
              Popayán, al inicio de la vía a Santa Rosa.
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {BENEFITS.map((item) => (
                <li key={item.title} className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="font-semibold text-brand-navy">{item.title}</p>
                  <p className="mt-1 text-sm text-brand-dark/70">{item.text}</p>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={TERRA_PROJECT.mapsDirections}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center rounded-full bg-brand-navy px-5 text-sm font-semibold text-white"
              >
                Cómo llegar
              </a>
              <a
                href="/terra/mapa"
                className="inline-flex min-h-12 items-center rounded-full border border-brand-navy/20 px-5 text-sm font-semibold text-brand-navy"
              >
                Mapa del proyecto
              </a>
            </div>
          </div>
          <img
            src={mapImg}
            alt="Plano de ubicación de TERRA en el km 1 de la vía Popayán–Santa Rosa"
            width={1600}
            height={847}
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-[28px] object-cover shadow-lg"
          />
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20" aria-label="Espacios proyectados">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold text-brand-navy">Espacios proyectados</h2>
          <p className="mt-2 text-sm text-brand-dark/70">
            Renders ilustrativos del paisaje, las manzanas y las vías.
          </p>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {GALLERY.map((item) => (
              <li key={item.title} className="group overflow-hidden rounded-[24px]">
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <p className="mt-3 text-sm font-semibold text-brand-navy">{item.title}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="desarrollo" className="bg-brand-cream py-16">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
              Quién desarrolla
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-brand-navy">
              {TERRA_PROJECT.company}
            </h2>
            <p className="mt-3 text-sm text-brand-dark/75">
              Preventa preliminar. La escrituración individual depende de las autorizaciones
              aplicables.
            </p>
            <p className="mt-4 text-sm">
              <a
                className="font-semibold text-brand-navy hover:text-brand-orange"
                href={`mailto:${TERRA_PROJECT.emailMercadeo}`}
                onClick={() =>
                  trackTerraEvent("contact_click", { channel: "email", location: "landing" })
                }
              >
                {TERRA_PROJECT.emailMercadeo}
              </a>
              <span className="mx-2 text-brand-dark/30">·</span>
              <a
                className="font-semibold text-brand-navy hover:text-brand-orange"
                href={`tel:+${TERRA_PROJECT.phoneE164}`}
                onClick={() =>
                  trackTerraEvent("contact_click", { channel: "phone", location: "landing" })
                }
              >
                {TERRA_PROJECT.phoneDisplay}
              </a>
            </p>
          </div>
          <div>
            <p className="text-sm text-brand-dark/70">
              Horizonte estimado: {TERRA_TIMELINE_HORIZON_MONTHS} meses.
            </p>
            <ol className="mt-4 grid gap-2 sm:grid-cols-2">
              {TERRA_TIMELINE.map((step, index) => (
                <li key={step.id} className="rounded-2xl bg-white px-4 py-3 text-sm">
                  <span className="text-[11px] font-semibold text-brand-orange">0{index + 1}</span>
                  <p className="font-semibold text-brand-navy">{step.title}</p>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-brand-dark/60">
              Cronograma estimado, sujeto a permisos y condiciones técnicas.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16" aria-label="Preguntas frecuentes">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold text-brand-navy">Preguntas frecuentes</h2>
          <Accordion type="single" collapsible className="mt-6">
            {FAQ.map((item, index) => (
              <AccordionItem key={item.q} value={`faq-${index}`}>
                <AccordionTrigger className="text-left text-base text-brand-navy">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-brand-dark/75">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
