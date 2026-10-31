import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/parametros/seed")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { POST_SEED } = await import("../server/terra/cotizador/api-parametros");
        return POST_SEED(request);
      },
    },
  },
});
