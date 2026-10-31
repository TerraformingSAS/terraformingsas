import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/parametros")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { GET } = await import("../server/terra/cotizador/api-parametros");
        return GET(request);
      },
    },
  },
});
