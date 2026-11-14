import { createFileRoute } from "@tanstack/react-router";
import { CotizadorGate } from "@/features/terra-cotizador/components/cotizador-shell";
import { ParametrosDinamicosPage } from "@/features/terra-cotizador-dinamico/pages/parametros";

export const Route = createFileRoute("/terra_/cotizador-dinamico_/parametros")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Parámetros del cotizador dinámico | TERRA" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <CotizadorGate requireAdmin>
      <ParametrosDinamicosPage />
    </CotizadorGate>
  ),
});
