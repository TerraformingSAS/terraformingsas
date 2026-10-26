import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/verificar-codigo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { POST } = await import("../server/terra/cotizador/verificar-codigo");
        return POST(request);
      },
    },
  },
});
