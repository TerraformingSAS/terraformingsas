import { LandingFinance } from "@/components/terra/landing/LandingFinance";
import { LandingLots } from "@/components/terra/landing/LandingLots";
import { cotizadorHref } from "@/components/terra/landing/links";
import { TerraLeadForm } from "@/components/terra/TerraLeadForm";
import { trackTerraEvent } from "@/lib/terra/analytics";
import { terraWhatsAppUrl } from "@/lib/terra/contact";

export function LotPreview() {
  return (
    <>
      <LandingLots />
      <LandingFinance />
      <section id="contacto" className="scroll-mt-24 bg-brand-navy py-16 text-white sm:py-24">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-brand-orange">Contacto</p>
            <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
              Cuéntanos qué lote estás mirando.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
              Deja tus datos o abre el cotizador. Si ya elegiste un lote en esta página, el enlace
              conserva esa selección.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={cotizadorHref()}
                onClick={() => trackTerraEvent("view_quote", { location: "cierre" })}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-orange px-6 text-sm font-semibold text-white"
              >
                Calcula tu cuota
              </a>
              <a
                href={terraWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackTerraEvent("whatsapp_click", { location: "cierre" })}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#25D366] px-6 text-sm font-semibold"
              >
                WhatsApp
              </a>
            </div>
          </div>
          <div className="rounded-[28px] bg-white p-2 text-brand-navy shadow-2xl">
            <TerraLeadForm compact />
          </div>
        </div>
      </section>
    </>
  );
}
