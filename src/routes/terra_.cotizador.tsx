import { CotizadorApp } from "@/features/terra-cotizador/components/cotizador-app";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terra_/cotizador")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cotizador de preventa | TERRA" },
      {
        name: "description",
        content: "Cotizador interno de preventa para vendedores autorizados de TERRA.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CotizadorApp,
});
