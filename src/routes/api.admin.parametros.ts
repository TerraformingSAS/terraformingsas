import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/parametros")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { GET_ADMIN } = await import("../server/terra/cotizador/api-parametros");
        return GET_ADMIN(request);
      },
      PUT: async ({ request }) => {
        const { PUT_ADMIN } = await import("../server/terra/cotizador/api-parametros");
        return PUT_ADMIN(request);
      },
    },
  },
});
