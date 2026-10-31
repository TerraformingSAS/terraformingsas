import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/cotizaciones/registrar")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { POST } = await import("../server/terra/cotizador/api-registrar-cotizacion");
        return POST(request);
      },
    },
  },
});
