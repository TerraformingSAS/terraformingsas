/**
 * Copia los recursos publicos del visor al despliegue del sitio principal.
 * Verifica SHA-256 contra los originales del ZIP compartido.
 * No descarga datos privados ni credenciales de SharePoint.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dest = join(root, "public", "terra", "estado");
const origin = "https://terraformingsas-terra-visor.vercel.app/terra/estado";
const expected = {
  "index.html": "7e03ca3e71b776fd3e849bbdb40eb90f180ac345d9537ffc89762479c35ea4b0",
  "estilos.css": "564bdfc9910a2c31075ee942ac7ce93abbf35c9b04002e32b5c05ac05f2c9f0a",
  "app.js": "012b96edad845fa0e95ebb1a8c4eb40f17a639ef41ddb8e01dce91f759c64360",
  "logo-terraforming.png": "6ec6eab54659f8d5c89291f7ed2d0c15842adedb69047e9435a3012f9dc681d5",
  "ubicacion-etapa-i.webp": "8c2d537b18f4e93eff6716e05340c5ad28edf216a50f7c2940b813f1ff1a9f94"
};
const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");

await mkdir(dest, { recursive: true });
for (const [name, hash] of Object.entries(expected)) {
  const path = join(dest, name);
  let bytes;
  try {
    bytes = await readFile(path);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  if (bytes) {
    if (sha256(bytes) !== hash) {
      throw new Error("El archivo local no coincide con el ZIP: " + name);
    }
    console.log("[TERRA] Verificado: " + name);
    continue;
  }
  // La pagina HTML se publica como ruta, no como /terra/estado/index.html.
  const remotePath = name === "index.html" ? "/terra/estado" : "/terra/estado/" + name;
  const response = await fetch("https://terraformingsas-terra-visor.vercel.app" + remotePath, {
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) {
    throw new Error("No se pudo obtener " + name + " (HTTP " + response.status + ")");
  }
  bytes = Buffer.from(await response.arrayBuffer());
  if (sha256(bytes) !== hash) {
    throw new Error("El archivo publicado difiere del ZIP: " + name);
  }
  await writeFile(path, bytes, { flag: "wx" });
  console.log("[TERRA] Incorporado: " + name);
}
