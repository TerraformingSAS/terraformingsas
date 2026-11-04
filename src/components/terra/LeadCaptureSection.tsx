import { Reveal } from "@/components/Reveal";
import { TerraLeadForm } from "@/components/terra/TerraLeadForm";
import { TerraKicker } from "@/components/terra/primitives";
import { TERRA_COPY } from "@/lib/terra/commercial";

export function LeadCaptureSection() {
  return (
    <section id="contacto" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="container-tf grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal>
          <TerraKicker>Contacto comercial</TerraKicker>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-brand-navy sm:text-4xl">
            {TERRA_COPY.formTitle}
          </h2>
          <p className="mt-4 max-w-md text-brand-dark/80">
            Si ya exploraste un lote, lo dejamos precargado. El equipo comercial te responde con la
            información vigente, sin comprometer una reserva hasta completar el proceso.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <TerraLeadForm />
        </Reveal>
      </div>
    </section>
  );
}
