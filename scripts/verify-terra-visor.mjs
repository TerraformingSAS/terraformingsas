import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const folder = join(root, "public", "terra", "estado");
const files = {
  "index.html": "7e03ca3e71b776fd3e849bbdb40eb90f180ac345d9537ffc89762479c35ea4b0",
  "estilos.css": "564bdfc9910a2c31075ee942ac7ce93abbf35c9b04002e32b5c05ac05f2c9f0a",
  "app.js": "012b96edad845fa0e95ebb1a8c4eb40f17a639ef41ddb8e01dce91f759c64360",
  "logo-terraforming.png": "6ec6eab54659f8d5c89291f7ed2d0c15842adedb69047e9435a3012f9dc681d5",
  "ubicacion-etapa-i.webp": "8c2d537b18f4e93eff6716e05340c5ad28edf216a50f7c2940b813f1ff1a9f94"
};

for (const [name, expected] of Object.entries(files)) {
  const content = await readFile(join(folder, name));
  const actual = createHash("sha256").update(content).digest("hex");
  if (expected !== actual) {
    throw new Error("El archivo del visor no coincide con el ZIP: " + name);
  }
  console.log("OK:", name, "(" + content.length + " bytes)");
}

const html = await readFile(join(folder, "index.html"), "utf8");
for (const name of Object.keys(files).filter(n => n !== "index.html")) {
  if (!html.includes("/terra/estado/" + name)) {
    throw new Error("El HTML no incluye el recurso esperado: " + name);
  }
}
const js = await readFile(join(folder, "app.js"), "utf8");
if (!js.includes("fetch('/api/terra-estado'")) {
  throw new Error("La ruta de consulta a SharePoint es diferente a la esperada");
}
console.log("El visor coincide con los archivos originales y conserva las rutas estaticas y API.");
