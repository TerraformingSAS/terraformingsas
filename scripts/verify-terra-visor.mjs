import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const folder = join(root, "public", "terra", "estado");
const files = {
  "index.html": "ede0707417580a497de97bb242c8e03a672a7e5f01a4119c46a7c863f9711958",
  "estilos.css": "6d0511c3b57b7809cab789c04a1a9f166c2b14baeadacc52c06930e089387566",
  "header.js": "633deb77c2e2356dc4942eb4c023574fd843becc4c91c9ad4f5c9c832e646001",
  "app.js": "1241a45a591aa713d681242b0d6fe59ab6c1dd426d7ff43ab7ed052e40adbafe",
  "logo-terraforming.png": "6ec6eab54659f8d5c89291f7ed2d0c15842adedb69047e9435a3012f9dc681d5",
  "ubicacion-etapa-i.webp": "1c293b51edf79fb92ae1b381a5c8b71405bcea8a0431386a4607ac4a548a42cb"
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
const rootApp = await readFile(join(root, "src", "routes", "__root.tsx"), "utf8");
const projectId = rootApp.match(/const CLARITY_PROJECT_ID = "([^"]+)"/)?.[1];
const clarityTracking = html.match(/https:\/\/www\.clarity\.ms\/tag\//g) ?? [];
if (!projectId || projectId !== "yvum2tlvam" ||
    !html.includes('(window,document,"clarity","script","' + projectId + '")') ||
    clarityTracking.length !== 1 ||
    html.indexOf('https://www.clarity.ms/tag/') > html.indexOf("</head>")) {
  throw new Error("El visor debe instalar Clarity en el head usando el mismo proyecto que el sitio.");
}
if (!js.includes("window.clarity('event','terra_lote_seleccionado')") ||
    !js.includes("window.clarity('set','terra_lote',lot.id)") ||
    !js.includes("window.clarity('set','terra_manzana',lot.manzana)") ||
    !js.includes("trackLotInteraction(p);highlight(p)")) {
  throw new Error("La selección del lote no registra eventos de Clarity.");
}
const startClarity = js.indexOf("function trackLotInteraction(lot){");
const endClarity = js.indexOf("\nfunction draw(data){", startClarity);
if (startClarity === -1 || endClarity === -1) {
  throw new Error("No se encontró la función de seguimiento de lotes.");
}
const clarityCalls = [];
const trackWithClarity = runInNewContext(js.slice(startClarity, endClarity) + "\ntrackLotInteraction", {
  window: { clarity: (...args) => clarityCalls.push(args) },
});
trackWithClarity({ id: "B-04", manzana: "B" });
if (clarityCalls.length !== 3 ||
    clarityCalls[0].join(":") !== "event:terra_lote_seleccionado" ||
    clarityCalls[1].join(":") !== "set:terra_manzana:B" ||
    clarityCalls[2].join(":") !== "set:terra_lote:B-04") {
  throw new Error("El evento Clarity no identifica correctamente el lote.");
}
const trackWithoutClarity = runInNewContext(js.slice(startClarity, endClarity) + "\ntrackLotInteraction", { window: {} });
trackWithoutClarity({ id: "C-01", manzana: "C" });

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
if (!presaleForm.includes('Preventa hasta el <span className="text-brand-orange">15 de noviembre</span>')) {
  throw new Error("La fecha comercial de preventa del formulario TERRA debe ser 15 de noviembre.");
}

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
const siteFooterStart = html.indexOf('<footer class="corporate-footer"');
const statusStart = html.indexOf('<div class="source-update"');
const statusId = html.indexOf('id="fecha"');
if (siteFooterStart < 0 || statusStart < 0 || statusId <= statusStart ||
    statusId >= siteFooterStart || html.includes('<footer class="site-footer"')) {
  throw new Error("La fuente debe estar al final del contenido, antes del footer corporativo.");
}
if (!js.includes("textContent='Fuente actualizada '") ||
    js.includes("textContent='Excel actualizado '") ||
    !css.includes('footer.corporate-footer') ||
    !css.includes('.corporate-footer__grid')) {
  throw new Error("La fuente actualizada o el footer corporativo no están configurados.");
}
for (const required of [
  "Enlaces", "Servicios", "Contacto",
  "Infraestructura vial", "Acueductos y alcantarillados",
  "Urbanismo y espacio público", "Vivienda y desarrollo urbano",
  "Movimiento de tierras", "Alumbrado público",
  "mailto:gerencia@terraformings.co", "mailto:mercadeo@terraformings.co",
  "tel:+573214230090",
  "Política de privacidad", "Tratamiento de datos",
]) {
  if (!html.slice(siteFooterStart).includes(required)) {
    throw new Error("Falta un elemento del footer corporativo: " + required);
  }
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
const privacyRoute = await readFile(join(root, "src", "routes", "politica-de-privacidad.tsx"), "utf8");
const requiredPolicyText = [
  "El área encargada de la atención de peticiones",
  "es el área de Mercadeo.",
  "Conservaremos copia o registro de la autorización",
  "mediante los contratos de transmisión de datos",
  "infraestructura ubicada fuera de Colombia",
  "Los reclamos se tramitarán en un plazo de quince (15) días hábiles contados",
  "dos (2) meses desde la fecha del requerimiento",
  "10. Vigencia de la base de datos",
  "hasta por 10 años",
  "11. Datos de menores de edad",
  "12. Vigencia y modificaciones",
  "se comunicarán",
  "antes de su implementación",
];
for (const fragment of requiredPolicyText) {
  if (!privacyRoute.includes(fragment)) {
    throw new Error("Falta texto de la política de privacidad: " + fragment);
  }
}
const numberedSections = [...privacyRoute.matchAll(/<h2[^>]*>([0-9]+)[.] /g)].map(m => Number(m[1]));
if (numberedSections.length !== 12 || numberedSections.some((number, index) => number !== index + 1)) {
  throw new Error("La política debe tener 12 secciones ordenadas.");
}
const headerComponent = await readFile(join(root, "src", "components", "Header.tsx"), "utf8");
const rootRoute = await readFile(join(root, "src", "routes", "__root.tsx"), "utf8");
const sitemapRoute = await readFile(join(root, "src", "routes", "sitemap[.]xml.ts"), "utf8");
if (!privacyRoute.includes('createFileRoute("/politica-de-privacidad")') ||
    !privacyRoute.includes("<Header solid />") ||
    !privacyRoute.includes("<Footer />") ||
    privacyRoute.includes("<img") || privacyRoute.includes("<form")) {
  throw new Error("La política debe tener ruta propia, encabezado y pie corporativos, con contenido textual.");
}
if (!corporateFooter.includes('href="/politica-de-privacidad"') ||
    !html.includes('href="/politica-de-privacidad"') ||
    !headerComponent.includes("solid || scrolled || open") ||
    !rootRoute.includes('<html lang="es">') ||
    !sitemapRoute.includes("/politica-de-privacidad")) {
  throw new Error("La política debe ser accesible desde todos los pies de página.");
}
if (!js.includes("const canQuote=lot.estado==='Disponible'") ||
    !js.includes("quote.removeAttribute('href')") ||
    !js.includes("quote.setAttribute('aria-disabled',String(!canQuote))") ||
    !css.includes('.quote-whatsapp[aria-disabled="true"]') ||
    !html.includes('aria-disabled="true" tabindex="-1"')) {
  throw new Error("Cotízame solo puede abrir WhatsApp para lotes disponibles.");
}
if (!html.includes("<strong>lotes urbanizados parcelables</strong>") ||
    !html.includes("<strong>se entregará con vías pavimentadas</strong>")) {
  throw new Error("Faltan las condiciones comerciales de entrega junto al plano.");
}
if (!html.includes("Imagina tu próximo comienzo en TERRA.")) {
  throw new Error("El texto comercial del plano no se actualizó.");
}

const from = js.indexOf("function highlight(lot){");
const until = js.indexOf("\nfunction setBlock(", from);
if (from < 0 || until < 0) throw new Error("No se puede analizar la selección de lotes.");
const quoteAttrs = new Map();
const quoteButton = {
  href: undefined,
  tabIndex: -1,
  setAttribute: (name, value) => quoteAttrs.set(name, String(value)),
  removeAttribute: (name) => {
    quoteAttrs.delete(name);
    if (name === "href") quoteButton.href = undefined;
  },
};
const elements = new Map([["#cotizar-lote", quoteButton]]);
const getElement = (selector) => {
  if (!elements.has(selector)) elements.set(selector, {});
  return elements.get(selector);
};
const highlightTest = runInNewContext(js.slice(from, until) + "\nhighlight", {
  chosen: "",
  document: { querySelectorAll: () => [] },
  $: getElement,
  number: (value) => String(value),
  whatsappQuoteUrl: (id) => "https://wa.me/573214230090?text=" + encodeURIComponent(id),
});
const sampleLot = (id, estado) => ({
  id,
  estado,
  medidas: { lado_a_m: 10, lado_b_m: 20, area_m2: 200 },
});
highlightTest(sampleLot("A-01", "Disponible"));
if (!quoteButton.href?.includes("A-01") ||
    quoteAttrs.get("aria-disabled") !== "false" ||
    quoteButton.tabIndex !== 0) {
  throw new Error("El lote disponible debe permitir cotizar.");
}
for (const estado of ["Reservado", "Vendido", "En negociación", "No disponible"]) {
  highlightTest(sampleLot("B-02", estado));
  if (quoteButton.href !== undefined ||
      quoteAttrs.get("aria-disabled") !== "true" ||
      quoteButton.tabIndex !== -1) {
    throw new Error("El lote con estado " + estado + " no debe permitir cotizar.");
  }
}
highlightTest(sampleLot("C-03", "Disponible"));
if (!quoteButton.href?.includes("C-03") ||
    quoteAttrs.get("aria-disabled") !== "false" ||
    quoteButton.tabIndex !== 0) {
  throw new Error("Un lote que vuelve a estar disponible debe permitir cotizar.");
}
console.log("OK: Cotízame solo está habilitado para lotes disponibles.");

console.log("El visor conserva sus rutas estáticas y la API, y valida los cambios autorizados.");
