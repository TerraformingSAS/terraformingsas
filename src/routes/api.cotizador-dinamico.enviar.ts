import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/cotizador-dinamico/enviar")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        (await import("../server/terra/cotizador-dinamico/api")).handlersDinamicos.enviar(request),
    },
  },
});
