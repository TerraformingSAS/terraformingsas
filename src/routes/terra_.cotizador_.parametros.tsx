import { AdminParametrosPage } from "@/features/terra-cotizador/components/admin-parametros-panel";
import { CotizadorGate } from "@/features/terra-cotizador/components/cotizador-shell";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terra_/cotizador_/parametros")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Parámetros del cotizador | TERRA" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminParametrosRoute,
});

function AdminParametrosRoute() {
  return (
    <CotizadorGate requireAdmin>
      <AdminParametrosPage />
    </CotizadorGate>
  );
}
