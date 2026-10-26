import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/yo")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { GET } = await import("../server/terra/cotizador/yo");
        return GET(request);
      },
    },
  },
});
