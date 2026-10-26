import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/cotizaciones/enviar")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { POST } = await import("../server/terra/cotizador/enviar-cotizacion");
        return POST(request);
      },
    },
  },
});
