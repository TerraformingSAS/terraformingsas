import { Reveal } from "@/components/Reveal";
import { TerraKicker } from "@/components/terra/primitives";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TERRA_FINANCING, TERRA_PROJECT, formatCopMillions } from "@/lib/terra/commercial";

const FAQ = [
  {
    q: "¿Dónde queda TERRA?",
    a: `TERRA está en ${TERRA_PROJECT.city}, ${TERRA_PROJECT.locationLine}. Puedes ver el predio en el mapa del proyecto y en la imagen de referencia geográfica.`,
  },
  {
    q: "¿Qué áreas hay disponibles?",
    a: "Las áreas se consultan lote a lote en el plano interactivo, con la información publicada en la fuente de disponibilidad. No se publican rangos inventados.",
  },
  {
    q: "¿Cómo elijo un lote?",
    a: "Entra al plano de la Etapa I, filtra por manzana, área o estado, y selecciona un lote para ver su nomenclatura, medidas y disponibilidad. Si está disponible, puedes solicitar cotización o escribir por WhatsApp.",
  },
  {
    q: "¿Cuál es la forma de pago?",
    a: TERRA_FINANCING.showPublicOffer
      ? `La separación anunciada es de ${formatCopMillions(TERRA_FINANCING.separacionCop)}. El esquema vigente contempla financiar el ${TERRA_FINANCING.financedPercent}% y destinar el ${TERRA_FINANCING.deliveryPercent}% restante a la entrega, según las condiciones de tu cotización.`
      : "Las condiciones de pago se confirman en la cotización personalizada.",
  },
  {
    q: "¿Qué condiciones de financiación existen?",
    a: "El cotizador contempla plazos de 12, 24 y 36 meses. Las cuotas se calculan con las reglas vigentes del lote seleccionado. En 24 y 36 meses se aplica el factor mensual configurado en el cotizador.",
  },
  {
    q: "¿Cuál es el cronograma?",
    a: "El horizonte estimado de desarrollo es de 36 meses. La etapa regulatoria inicial se estima en 6 a 8 meses. El resto de fases depende de permisos, aprobaciones y condiciones técnicas.",
  },
  {
    q: "¿Cuál es el estado regulatorio?",
    a: "El proyecto está en estructuración, diseño y preventa preliminar. Adelanta estudios y documentos técnicos para su radicación y gestiones ante las autoridades competentes. No se informa aquí la obtención de licencias que no estén confirmadas.",
  },
  {
    q: "¿Qué incluye la urbanización?",
    a: "La Etapa I ofrece lotes urbanizados parcelables y el proyecto se entregará con vías pavimentadas. Senderos, ciclovías, parques y la zona comercial forman parte del alcance proyectado.",
  },
  {
    q: "¿Cuándo es la entrega?",
    a: "La entrega está sujeta a permisos, aprobaciones y condiciones técnicas. No se garantiza una fecha invariable.",
  },
  {
    q: "¿Habrá escritura individual?",
    a: "La escrituración individual está prevista cuando se obtengan las autorizaciones aplicables y se perfeccionen los documentos contractuales correspondientes.",
  },
  {
    q: "¿Cómo solicito una cotización?",
    a: "Completa el formulario de esta página, explora un lote en el plano o escribe por WhatsApp indicando el código del lote de interés.",
  },
] as const;

export function TerraFAQ() {
  return (
    <section id="preguntas" className="scroll-mt-24 bg-brand-cream py-20 sm:py-28">
      <div className="container-tf grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <TerraKicker>Preguntas frecuentes</TerraKicker>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-brand-navy sm:text-4xl">
            Respuestas sobre TERRA
          </h2>
          <p className="mt-4 text-brand-dark/80">
            Información verificada del proyecto. Las condiciones particulares se confirman en cada
            cotización.
          </p>
        </Reveal>
        <Accordion type="single" collapsible className="bg-white px-5">
          {FAQ.map((item, index) => (
            <AccordionItem key={item.q} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-display text-base text-brand-navy">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-brand-dark/80">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
