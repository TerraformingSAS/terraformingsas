import { createFileRoute } from "@tanstack/react-router";
import { CotizadorGate } from "@/features/terra-cotizador/components/cotizador-shell";
import { CotizadorDinamicoPage } from "@/features/terra-cotizador-dinamico/pages/home";

export const Route = createFileRoute("/terra_/cotizador-dinamico")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cotizador dinámico | TERRA" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <CotizadorGate>
      <CotizadorDinamicoPage />
    </CotizadorGate>
  ),
});
