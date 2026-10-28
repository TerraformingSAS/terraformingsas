import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TerraLegalNoticeBody } from "@/components/terra/TerraLegalNotice";
import { pageSeo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terra_/avisolegal")({
  head: () =>
    pageSeo({
      title: "Información importante y aviso legal | TERRA",
      description:
        "Aviso legal de TERRA: el proyecto está en estructuración, diseño y preventa preliminar. La información publicada es ilustrativa y no constituye oferta comercial.",
      path: "/terra/avisolegal",
    }),
  component: TerraLegalNoticePage,
});

function TerraLegalNoticePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-brand-navy">
      <Header solid />
      <main className="mx-auto w-full max-w-[860px] flex-1 px-5 pb-20 pt-32 sm:px-8 sm:pb-28 sm:pt-36">
        <article>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
            Aviso legal
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            TERRA — Información importante
          </h1>
          <TerraLegalNoticeBody />
        </article>
      </main>
      <Footer />
    </div>
  );
}
