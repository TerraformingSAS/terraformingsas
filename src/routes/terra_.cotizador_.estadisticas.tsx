import { AdminEstadisticasPage } from "@/features/terra-cotizador/components/admin-estadisticas";
import { CotizadorGate } from "@/features/terra-cotizador/components/cotizador-shell";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terra_/cotizador_/estadisticas")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Estadísticas del cotizador | TERRA" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminEstadisticasRoute,
});

function AdminEstadisticasRoute() {
  return (
    <CotizadorGate requireAdmin>
      <AdminEstadisticasPage />
    </CotizadorGate>
  );
}
