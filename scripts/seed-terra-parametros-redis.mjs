/**
 * Siembra en Upstash Redis los mensajes (y params) del cotizador.
 *
 * Uso (con vars de Vercel):
 *   vercel env pull .env.local --environment=production --yes
 *   set -a && source .env.local && set +a
 *   node scripts/seed-terra-parametros-redis.mjs
 *
 * O exportando:
 *   KV_REST_API_URL=… KV_REST_API_TOKEN=… node scripts/seed-terra-parametros-redis.mjs
 *   # opcional: --forzar  (pisa valores existentes de mensajes)
 */
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const forzar = process.argv.includes("--forzar");
const KEY = "terra:cotizador:parametros";

if (!url || !token) {
  console.error("Faltan KV_REST_API_URL / KV_REST_API_TOKEN (o UPSTASH_REDIS_REST_*)");
  process.exit(1);
}

const MENSAJES = {
  msg_cuota_extra: "La cuota incluye valorización e IPC",
  msg_cuotas_valorizacion:
    "En las cuotas a 24 y 36 meses, la cuota incluye valorización e IPC.",
  msg_no_reserva:
    "Esta cotización no implica reserva del lote ni perfecciona por sí sola su compraventa.",
  empresa_nombre: "TERRA FORMING SAS",
  nit: "9018681500",
  banco: "Banco de Bogotá",
  cuenta: "Cuenta corriente No. 256708884",
  email_mercadeo: "mercadeo@terraformings.co",
  telefono: "321 423 0090",
  direccion: "Calle 10 # 4-40, Of. 1001, Edificio Bolsa de Occidente · Cali",
  vigencia_dias: "5",
};

async function redis(parts) {
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(parts),
  });
  if (!res.ok) throw new Error(`Redis ${res.status} ${await res.text()}`);
  const body = await res.json();
  return body.result;
}

const raw = await redis(["GET", KEY]);
let actual = {};
if (raw) {
  try {
    actual = JSON.parse(raw);
  } catch {
    actual = {};
  }
}

const next = { ...actual };
const escritos = [];
for (const [k, v] of Object.entries(MENSAJES)) {
  if (!forzar && actual[k] != null && String(actual[k]) !== "") continue;
  next[k] = v;
  escritos.push(k);
}

await redis(["SET", KEY, JSON.stringify(next)]);
console.log(
  escritos.length
    ? `OK · sembrados ${escritos.length}: ${escritos.join(", ")}`
    : "OK · nada nuevo (usa --forzar para pisar)",
);
console.log(`Clave Redis: ${KEY} · total claves: ${Object.keys(next).length}`);
