import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/accesos")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { GET } = await import("../server/terra/cotizador/api-accesos");
        return GET(request);
      },
    },
  },
});
