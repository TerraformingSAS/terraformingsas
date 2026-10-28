// Microsoft Graph con token de aplicación (client credentials) de "TERRA Disponibilidad".
import { env } from "./env.js";

let cache: { token: string; exp: number } | null = null;

export class GraphError extends Error {
  constructor(
    public status: number,
    public path: string,
  ) {
    super(`Graph ${status} en ${path}`);
  }
}

async function token(): Promise<string> {
  if (cache && cache.exp > Date.now() + 60_000) return cache.token;
  const res = await fetch(
    `https://login.microsoftonline.com/${env("AZURE_TENANT_ID")}/oauth2/v2.0/token`,
    {
      method: "POST",
      signal: AbortSignal.timeout(15_000),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env("AZURE_CLIENT_ID"),
        client_secret: env("AZURE_CLIENT_SECRET"),
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    },
  );
  if (!res.ok) throw new GraphError(res.status, "token");
  const j = (await res.json()) as { access_token: string; expires_in: number };
  cache = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return cache.token;
}

export async function graph<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
      ...init,
      signal: init.signal ?? AbortSignal.timeout(20_000),
      headers: {
        Authorization: `Bearer ${await token()}`,
        "Content-Type": "application/json",
        ...(init.headers as Record<string, string> | undefined),
      },
    });
  } catch (e) {
    if (e instanceof Error && e.name === "TimeoutError") throw new GraphError(504, path);
    throw e;
  }
  if (!res.ok) {
    console.error("graph error", res.status, path, await res.text().catch(() => ""));
    throw new GraphError(res.status, path);
  }
  if (res.status === 202 || res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
