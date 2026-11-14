import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/cotizador-dinamico/parametros")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        (await import("../server/terra/cotizador-dinamico/api")).handlersDinamicos.parametros(
          request,
        ),
      PUT: async ({ request }) =>
        (await import("../server/terra/cotizador-dinamico/api")).handlersDinamicos.parametros(
          request,
        ),
    },
  },
});
