import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const root = ".vercel/output/functions";
let functions = [];
try {
  functions = (await readdir(root)).filter((name) => name.endsWith(".func"));
} catch {
  throw Error("El build con NITRO_PRESET=vercel no genero .vercel/output/functions.");
}
if (!functions.length) throw Error("Vercel no genero ninguna funcion.");

const entries = [];
async function visit(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await visit(path);
    else if (entry.isFile()) entries.push(path);
  }
}
await visit(root);
const codePaths = entries.filter((path) => /\.(mjs|cjs|js)$/.test(path));
const matches = [];
for (const path of codePaths) {
  const source = await readFile(path, "utf8");
  const found = [...source.matchAll(/\brequire\s*\(\s*["'](fflate|fast-xml-parser)["']\s*\)/g)];
  if (found.length) matches.push({ path: relative(root, path), dependencies: [...new Set(found.map(x => x[1]))] });
}

console.log("Funciones Vercel:", functions);
console.log("Archivos de servidor:", codePaths.length);
console.log("Requieren Node externamente:", JSON.stringify(matches));
const included = entries.filter((path) => /node_modules\/(fflate|fast-xml-parser)\//.test(path.replace(/\\/g, "/")));
console.log("Dependencias incluidas como modulos:", included.length);

if (matches.length && !included.length) {
  throw Error("Persisten require() de fflate/fast-xml-parser, pero no aparecen los paquetes en las funciones Vercel.");
}
console.log("Comprobacion de dependencias Vercel finalizada.");
