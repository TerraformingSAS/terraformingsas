import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/cotizador-dinamico/cotizaciones")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        (await import("../server/terra/cotizador-dinamico/api")).handlersDinamicos.cotizaciones(
          request,
        ),
      POST: async ({ request }) =>
        (await import("../server/terra/cotizador-dinamico/api")).handlersDinamicos.cotizaciones(
          request,
        ),
    },
  },
});
