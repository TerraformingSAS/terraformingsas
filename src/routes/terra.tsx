import { BackToTop } from "@/components/BackToTop";
import { CampaignCapture } from "@/components/terra/CampaignCapture";
import { CommercialConditions } from "@/components/terra/CommercialConditions";
import { LocationSection } from "@/components/terra/LocationSection";
import { LotPreview } from "@/components/terra/LotPreview";
import { ProjectGallery } from "@/components/terra/ProjectGallery";
import { ProjectTrust } from "@/components/terra/ProjectTrust";
import { TerraCta } from "@/components/terra/TerraCta";
import { TerraFAQ } from "@/components/terra/TerraFAQ";
import { TerraFooter } from "@/components/terra/TerraFooter";
import { TerraHeader } from "@/components/terra/TerraHeader";
import { TerraHero } from "@/components/terra/TerraHero";
import { InstagramButton } from "@/components/InstagramButton";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { terraWhatsAppUrl } from "@/lib/terra/contact";
import { absoluteUrl, pageSeo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terra")({
  head: () => ({
    ...pageSeo({
      title: "TERRA | Lotes residenciales en Popayán",
      description:
        "TERRA Etapa I: lotes residenciales en el km 1 vía Popayán–Santa Rosa. Conoce el proyecto, explora el plano interactivo y solicita una cotización personalizada.",
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
    <div className="min-h-screen bg-white text-brand-navy">
      <CampaignCapture />
      <TerraHeader />
      <main id="contenido">
        <TerraHero />
        <LocationSection />
        <CommercialConditions />
        <ProjectGallery />
        <LotPreview />
        <ProjectTrust />
        <TerraFAQ />
        <TerraCta />
      </main>
      <TerraFooter />
      <InstagramButton />
      <WhatsAppButton href={terraWhatsAppUrl()} />
      <BackToTop className="bottom-[9.5rem]" />
    </div>
  );
}
