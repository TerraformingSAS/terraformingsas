/** Tipos del handler CommonJS original del ZIP. No se publica en cliente. */
interface TerraLegacyResponse {
  setHeader(name: string, value: string): TerraLegacyResponse;
  status(code: number): TerraLegacyResponse;
  json(data: unknown): Response;
}
declare const terraHandler: (
  request: { method: string },
  response: TerraLegacyResponse,
) => Promise<Response>;
export = terraHandler;
