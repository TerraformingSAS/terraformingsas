import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const folder = join(root, "public", "terra", "estado");
const files = {
  "index.html": "c4bad9e68a2b71fb3cf8acf72912226bec6934dc6027a59afba27f2df422db5b",
  "estilos.css": "7b6e2673151916899da979994f92b92db9c3ae02700fc0e4b206bfea489e263e",
  "header.js": "633deb77c2e2356dc4942eb4c023574fd843becc4c91c9ad4f5c9c832e646001",
  "app.js": "37bb607982b3c1abe63919d120b4b75f615e2ffb95b84234412b45fa43ac9641",
  "logo-terraforming.png": "6ec6eab54659f8d5c89291f7ed2d0c15842adedb69047e9435a3012f9dc681d5",
  "ubicacion-etapa-i.webp": "ba5f191e96dd8d834a1753726cd4d031bca8e2c6fd89c32120e4b752e3cee493"
};

for (const [name, expected] of Object.entries(files)) {
  const content = await readFile(join(folder, name));
  const actual = createHash("sha256").update(content).digest("hex");
  if (expected !== actual) {
    throw new Error("El archivo del visor no coincide con la versión validada: " + name + " (esperado " + expected + ", actual " + actual + ")");
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
const headerJs = await readFile(join(folder, "header.js"), "utf8");
await readFile(join(folder, "logo-color.png"));
if (!html.includes('/terra/estado/logo-color.png') ||
    !html.includes('id="site-header"') ||
    !html.includes('id="site-mobile-nav"') ||
    !html.includes('href="#explorar-lotes"') ||
    !html.includes('id="explorar-lotes"')) {
  throw new Error("El encabezado corporativo o el acceso al plano no están completos.");
}
if (!headerJs.includes('aria-expanded') || !headerJs.includes('window.scrollY > 40')) {
  throw new Error("El menú móvil y la transición del encabezado deben seguir activos.");
}
const terraPage = await readFile(join(root, "src", "routes", "terra.tsx"), "utf8");
if (terraPage.includes('Separa tu lote') || !terraPage.includes('Quiero más información')) {
  throw new Error("El hero de /terra debe conservar solo el botón de información.");
}
if (!js.includes("fetch('/api/terra-estado'")) {
  throw new Error("La ruta de consulta a SharePoint es diferente a la esperada");
}
if (js.includes("svg.addEventListener('wheel'")) {
  throw new Error("El plano no debe capturar la rueda del mouse.");
}
for (const id of ["mas", "menos", "ajustar"]) {
  if (!js.includes("$('#" + id + "').addEventListener('click'")) {
    throw new Error("Falta el botón de control de zoom: " + id);
  }
}
if (!html.includes("Imagina tu próximo comienzo en TERRA.")) {
  throw new Error("El texto comercial del plano no se actualizó.");
}
console.log("El visor conserva sus rutas estáticas y la API, y valida los cambios autorizados.");
