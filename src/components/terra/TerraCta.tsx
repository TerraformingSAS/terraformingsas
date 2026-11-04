import cierreImg from "@/assets/terra/seccion-final.png";
import { Reveal } from "@/components/Reveal";
import { WhatsAppIcon } from "@/components/terra/icons";
import { TerraPrimaryLink, TerraSecondaryLink } from "@/components/terra/primitives";
import { trackTerraEvent } from "@/lib/terra/analytics";
import { TERRA_COPY, TERRA_PROJECT } from "@/lib/terra/commercial";
import { terraWhatsAppUrl } from "@/lib/terra/contact";

export function TerraCta() {
  return (
    <section className="relative overflow-hidden py-20 text-white sm:py-24">
      <img
        src={cierreImg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-left"
        width={1921}
        height={819}
        loading="lazy"
        aria-hidden
      />
      <div className="relative container-tf">
        <Reveal>
          <div className="ml-auto max-w-xl lg:text-right">
            <h2 className="font-display text-2xl font-bold leading-tight sm:text-4xl">
              {TERRA_COPY.closingLead}
            </h2>
            <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row lg:justify-end">
              <TerraPrimaryLink href={TERRA_PROJECT.explorerPath}>Conocer lotes</TerraPrimaryLink>
              <TerraSecondaryLink
                href={terraWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="border-white/40 text-white hover:bg-white/10"
                onClick={() => trackTerraEvent("whatsapp_click", { location: "closing" })}
              >
                <WhatsAppIcon />
                Hablar con un asesor
              </TerraSecondaryLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
