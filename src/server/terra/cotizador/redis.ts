// Cliente REST mínimo de Upstash; evita incorporar un runtime adicional al proyecto principal.
const url = () => process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";

async function command<T>(parts: Array<string | number>): Promise<T> {
  if (!url() || !token()) throw new Error("Falta configurar Upstash Redis");
  const response = await fetch(url(), {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    body: JSON.stringify(parts),
  });
  if (!response.ok) throw new Error(`Redis ${response.status}`);
  const body = (await response.json()) as { result: T };
  return body.result;
}

export const redis = {
  incr: (key: string) => command<number>(["INCR", key]),
  expire: (key: string, seconds: number) => command<number>(["EXPIRE", key, seconds]),
  del: (key: string) => command<number>(["DEL", key]),
  async get<T>(key: string): Promise<T | null> {
    const value = await command<string | null>(["GET", key]);
    return value === null ? null : (JSON.parse(value) as T);
  },
  set<T>(key: string, value: T, options: { ex?: number; keepTtl?: boolean } = {}) {
    const parts: Array<string | number> = ["SET", key, JSON.stringify(value)];
    if (options.ex) parts.push("EX", options.ex);
    if (options.keepTtl) parts.push("KEEPTTL");
    return command<string>(parts);
  },
};
