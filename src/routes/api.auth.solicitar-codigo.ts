import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/solicitar-codigo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { POST } = await import("../server/terra/cotizador/solicitar-codigo");
        return POST(request);
      },
    },
  },
});
