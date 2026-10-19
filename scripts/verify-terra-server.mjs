import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = join(process.cwd(), "src", "server", "terra");
const files = {
  "api/terra-estado.cjs": "4864a70952a31d37d70667873238d9cc9b0e6ab1f13f68a4c309b46ff375a31f",
  "lib/excel.cjs": "3bea7b147e51d7f2ac410580f4f53c8c21b8ac12e2536d71ab9c1eafc5d49cef",
  "lib/geometria.json": "c1edf98e1c00e552dd1a7ccc3b1c59f2ff3f811701e703ecb5d73b8d1f3d91c8",
  "lib/sharepoint-config.json": "9c6e542c97981aa7663b30fe2c42cd317ac5369ecd2c8762135bc2ecca957b84",
  "lib/sharepoint.cjs": "5b969ad8d54c73e74e084e5b8f09c6adfceb291b2e8570ba0b15fa53b3be29b5",
  "lib/xlsx.cjs": "d2b99094731c2ed72ede38bb9c1e794ca31df544a064b7cf813a126c1b7c1fee"
};
for (const [name, sha] of Object.entries(files)) {
  const content = await readFile(join(root, name));
  if (createHash("sha256").update(content).digest("hex") !== sha) {
    throw Error("El archivo no coincide con el ZIP: " + name);
  }
  console.log("OK servidor:", name);
}
const route = await readFile(join(process.cwd(), "src", "routes", "api.terra-estado.ts"), "utf8");
if (!route.includes('createFileRoute("/api/terra-estado")') ||
    !route.includes("../server/terra/api/terra-estado.cjs")) {
  throw Error("Falta la ruta de API propia de TanStack Start");
}
const vercel = await readFile(join(process.cwd(), "vercel.json"), "utf8");
if (vercel.includes("terraformingsas-terra-visor.vercel.app")) {
  throw Error("La configuracion aun usa el proyecto Vercel eliminado");
}
console.log("API TERRA conectada localmente, sin usar el antiguo Vercel.");
