import { createFileRoute } from "@tanstack/react-router";

const readOnlyHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

const methodNotAllowed = () =>
  Response.json(
    { error: "Método no permitido." },
    { status: 405, headers: { ...readOnlyHeaders, Allow: "GET" } },
);

/**
 * La API original del ZIP es CommonJS y devuelve JSON mediante req/res.
 * Este adaptador ejecuta el handler exclusivamente en el servidor de
 * TanStack Start y transforma la respuesta sin modificar los datos.
 */
export const Route = createFileRoute("/api/terra-estado")({
  server: {
    handlers: {
      GET: async () => {
        const { default: handler } = await import(
          "../server/terra/api/terra-estado.cjs"
        );
        const headers = new Headers(readOnlyHeaders);
        let statusCode = 200;
        const response = {
          setHeader(name: string, value: string) {
            headers.set(name, value);
            return this;
          },
          status(code: number) {
            statusCode = code;
            return this;
          },
          json(data: unknown) {
            return Response.json(data, { status: statusCode, headers });
          },
        };
        return handler({ method: "GET" }, response);
      },
      POST: methodNotAllowed,
      PUT: methodNotAllowed,
      PATCH: methodNotAllowed,
      DELETE: methodNotAllowed,
    },
  },
});
