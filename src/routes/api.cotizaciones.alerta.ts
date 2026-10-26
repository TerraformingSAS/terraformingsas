import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/cotizaciones/alerta")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { alertar } = await import("../server/terra/cotizador/enviar-cotizacion");
        return alertar(request);
      },
    },
  },
});
