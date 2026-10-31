import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/estadisticas")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { GET } = await import("../server/terra/cotizador/api-estadisticas");
        return GET(request);
      },
    },
  },
});
