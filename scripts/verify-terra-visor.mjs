import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const folder = join(root, "public", "terra", "estado");
const files = {
  "index.html": "27eda23f2dd886417c58855671ee239bbfb935a33795b30f8d74a741c9b15e9e",
  "estilos.css": "70a52b26ee1d8b7007c2671b19b47a392cec038cd94e73ba6e50d8273d6dc4a0",
  "header.js": "633deb77c2e2356dc4942eb4c023574fd843becc4c91c9ad4f5c9c832e646001",
  "app.js": "8e45d29540666f247d1d86b3bbb3f2e271df5a1c6d149c0421474121f5add9a3",
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
const css = await readFile(join(folder, "estilos.css"), "utf8");
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
const generalForm = await readFile(join(root, "src", "components", "Contact.tsx"), "utf8");
const presaleForm = await readFile(join(root, "src", "components", "terra", "TerraLeadForm.tsx"), "utf8");
for (const required of [
  'name="origen" value="Página principal"',
  'value="Terraforming | Nuevo contacto desde la página principal"',
  'new FormData(ev.currentTarget)',
  'name="from_name"',
]) {
  if (!generalForm.includes(required)) {
    throw new Error("El formulario principal no identifica su origen en Web3Forms: " + required);
  }
}
for (const required of [
  'data.set("origen", "Preventa TERRA")',
  'data.set("subject", "TERRA | Nuevo interesado en preventa")',
  'data.set("referido_por", values.referido_por.trim() || "No informado")',
  'name="referido_por" type="text"',
  '¿Quién te contó de nosotros?',
  'maxLength={100}',
]) {
  if (!presaleForm.includes(required)) {
    throw new Error("El formulario de preventa no incluye los datos esperados: " + required);
  }
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
if (!html.includes('id="cotizar-lote"') ||
    !html.includes('class="quote-whatsapp"') ||
    !html.includes('Cotízame') ||
    !html.includes('target="_blank"') ||
    !css.includes('.quote-whatsapp{') ||
    !css.includes('border-radius:999px')) {
  throw new Error("Falta el botón verde y redondeado de WhatsApp en el flotante.");
}
if (!js.includes('quote.href=whatsappQuoteUrl(lot.id)') ||
    !js.includes('encodeURIComponent(message)') ||
    !js.includes("const WHATSAPP_PHONE='573214230090'")) {
  throw new Error("El enlace de WhatsApp no está asociado dinámicamente al lote seleccionado.");
}
const corporateFooter = await readFile(join(root, "src", "components", "Footer.tsx"), "utf8");
for (const content of [html, corporateFooter]) {
  for (const required of [
    "Calle 10 # 4 - 40, Oficina 1001",
    "Edificio Bolsa de Occidente, San Pedro",
    "Cali, Valle del Cauca, Colombia",
    'mailto:gerencia@terraformings.co',
    'mailto:mercadeo@terraformings.co',
  ]) {
    if (!content.includes(required)) {
      throw new Error("Falta información corporativa en uno de los pies de página: " + required);
    }
  }
}
if (!css.includes('justify-content:flex-end;margin-top:12px') ||
    !html.includes('class="selection-actions"') ||
    !html.includes('id="cotizar-lote"')) {
  throw new Error("El botón Cotízame debe aparecer abajo a la derecha del flotante.");
}
if (!html.includes("Imagina tu próximo comienzo en TERRA.")) {
  throw new Error("El texto comercial del plano no se actualizó.");
}
console.log("El visor conserva sus rutas estáticas y la API, y valida los cambios autorizados.");
