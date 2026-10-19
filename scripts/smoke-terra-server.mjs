import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const port = 45421;
const base = "http://127.0.0.1:" + port;
const server = spawn(process.execPath, [".output/server/index.mjs"], {
  env: {
    ...process.env,
    PORT: String(port),
    NITRO_PORT: String(port),
    HOST: "127.0.0.1",
    NITRO_HOST: "127.0.0.1",
    MS_CLIENT_SECRET: "",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let output = "";
for (const stream of [server.stdout, server.stderr]) {
  stream.on("data", (chunk) => {
    output += String(chunk);
    if (output.length > 12000) output = output.slice(-12000);
  });
}

async function request(path, options = {}) {
  return fetch(base + path, { signal: AbortSignal.timeout(1500), ...options });
}
async function assertStatus(path, status, options) {
  const response = await request(path, options);
  if (response.status !== status) {
    const snippet = (await response.text()).slice(0, 400);
    throw Error(path + ": se esperaba HTTP " + status + ", llegó " +
      response.status + ". Respuesta: " + snippet);
  }
  console.log("OK " + status + " " + path);
  return response;
}

try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    if (server.exitCode !== null) break;
    try {
      const probe = await request("/terra/estado/estilos.css");
      if (probe.status === 200) { ready = true; break; }
    } catch {}
    await delay(250);
  }
  if (!ready) throw Error("Nitro no inició o no sirve los estilos del visor.");

  const api = await assertStatus("/api/terra-estado", 503);
  const data = await api.json();
  if (typeof data.error !== "string" || !data.error.includes("disponibilidad")) {
    throw Error("La API respondió 503 sin el mensaje controlado del ZIP.");
  }
  await assertStatus("/api/terra-estado", 405, { method: "POST" });
  await assertStatus("/terra/estado/index.html", 200);
  await assertStatus("/terra/estado/estilos.css", 200);
  await assertStatus("/terra/estado/app.js", 200);
  await assertStatus("/terra/estado/logo-terraforming.png", 200);
  await assertStatus("/terra/estado/ubicacion-etapa-i.webp", 200);
  await assertStatus("/", 200);
  await assertStatus("/terra", 200);
  console.log("Smoke test completo: servidor, API sin secretos y sitio comercial.");
} catch (error) {
  console.error(output.slice(-5000));
  console.error(error);
  process.exitCode = 1;
} finally {
  server.kill("SIGTERM");
}
