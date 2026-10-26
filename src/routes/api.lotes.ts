import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/lotes")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { GET } = await import("../server/terra/cotizador/lotes");
        return GET(request);
      },
    },
  },
});
