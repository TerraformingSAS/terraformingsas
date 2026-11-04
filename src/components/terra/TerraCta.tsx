import logoTerra from "@/assets/terra/logo-terra-claim.png";
import { Reveal } from "@/components/Reveal";
import { WhatsAppIcon } from "@/components/terra/icons";
import { TerraPrimaryLink, TerraSecondaryLink } from "@/components/terra/primitives";
import { trackTerraEvent } from "@/lib/terra/analytics";
import { TERRA_COPY, TERRA_PROJECT } from "@/lib/terra/commercial";
import { terraWhatsAppUrl } from "@/lib/terra/contact";

export function TerraCta() {
  return (
    <section className="px-4 sm:px-6">
      <div className="overflow-hidden rounded-3xl bg-[#3f6b36] text-white">
        <div className="container-tf grid items-center gap-6 py-8 sm:py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 lg:py-12">
          <Reveal>
            <img
              src={logoTerra}
              alt="TERRA. Naturaleza que te pertenece"
              className="mx-auto w-full max-w-md"
              width={960}
              height={728}
              loading="lazy"
            />
          </Reveal>
          <Reveal>
            <div className="lg:text-right">
              <h2 className="font-display text-2xl font-bold leading-tight sm:text-4xl">
                {TERRA_COPY.closingLead}
              </h2>
              <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row lg:justify-end">
                <TerraPrimaryLink href={TERRA_PROJECT.explorerPath}>Conocer lotes</TerraPrimaryLink>
                <TerraSecondaryLink
                  href={terraWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-white/50 text-white hover:bg-white/10"
                  onClick={() => trackTerraEvent("whatsapp_click", { location: "closing" })}
                >
                  <WhatsAppIcon />
                  Hablar con un asesor
                </TerraSecondaryLink>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
