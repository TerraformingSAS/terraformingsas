import { BackToTop } from "@/components/BackToTop";
import { InstagramButton } from "@/components/InstagramButton";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CampaignCapture } from "@/components/terra/CampaignCapture";
import { LandingHeader } from "@/components/terra/landing/LandingHeader";
import { PublicSimulator } from "@/components/terra/landing/PublicSimulator";
import { LocationSection } from "@/components/terra/LocationSection";
import { LotPreview } from "@/components/terra/LotPreview";
import { TerraFooter } from "@/components/terra/TerraFooter";
import { TerraHero } from "@/components/terra/TerraHero";
import { terraWhatsAppUrl } from "@/lib/terra/contact";
import { absoluteUrl, pageSeo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terra")({
  head: () => ({
    ...pageSeo({
      title: "TERRA | Lotes residenciales en Popayán",
      description:
        "TERRA Etapa I: lotes residenciales en el km 1 vía Popayán–Santa Rosa. Explora precios, financiación y cotiza en el cotizador del proyecto.",
      path: "/terra",
      imagePath: "/terra/estado/ubicacion-etapa-i.webp",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${absoluteUrl("/terra")}#webpage`,
          url: absoluteUrl("/terra"),
          name: "TERRA | Lotes residenciales en Popayán",
          inLanguage: "es-CO",
          isPartOf: { "@id": `${absoluteUrl("/")}#website` },
          about: {
            "@type": "Place",
            name: "TERRA",
            description:
              "Proyecto inmobiliario en fase de estructuración, diseño y preventa preliminar.",
          },
          description:
            "Página del proyecto TERRA, en fase de estructuración, diseño y preventa preliminar. La información publicada es ilustrativa.",
        }),
      },
    ],
  }),
  component: TerraPage,
});

function TerraPage() {
  return (
    <div className="terra-landing min-h-screen bg-white text-brand-navy">
      <CampaignCapture />
      <LandingHeader />
      <main id="contenido">
        <TerraHero />
        <LotPreview />
        <LocationSection />
      </main>
      <TerraFooter />
      <PublicSimulator />
      <InstagramButton />
      <WhatsAppButton href={terraWhatsAppUrl()} />
      <BackToTop className="bottom-[9.5rem]" />
    </div>
  );
}
