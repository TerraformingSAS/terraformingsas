/**
 * Crea (si no existen) las listas SharePoint del cotizador admin:
 *  - Parametros Cotizador
 *  - Cotizaciones Cotizador
 *
 * Uso:
 *   MS_TENANT_ID=… MS_CLIENT_ID=… MS_CLIENT_SECRET=… \
 *   SP_SITE_ID=… node scripts/setup-terra-cotizador-listas.mjs
 *
 * Imprime los IDs para SP_PARAMETROS_LIST_ID y SP_COTIZACIONES_LIST_ID.
 */
const tenant = process.env.MS_TENANT_ID || process.env.AZURE_TENANT_ID;
const clientId = process.env.MS_CLIENT_ID || process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.MS_CLIENT_SECRET || process.env.AZURE_CLIENT_SECRET;
const siteId =
  process.env.SP_SITE_ID ||
  "intelecto1.sharepoint.com,e13795b1-6624-4274-9b96-247d755df923,c5470bdd-ca53-41ef-a9f0-b0548bd5da7f";

if (!tenant || !clientId || !clientSecret) {
  console.error("Faltan MS_TENANT_ID / MS_CLIENT_ID / MS_CLIENT_SECRET");
  process.exit(1);
}

async function token() {
  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) throw new Error(`token ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function graph(tok, path, init = {}) {
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${tok}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method || "GET"} ${path} → ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

async function findList(tok, displayName) {
  const r = await graph(
    tok,
    `/sites/${siteId}/lists?$filter=displayName eq '${displayName.replace(/'/g, "''")}'`,
  );
  return r.value?.[0] ?? null;
}

async function ensureColumn(tok, listId, col) {
  try {
    await graph(tok, `/sites/${siteId}/lists/${listId}/columns`, {
      method: "POST",
      body: JSON.stringify(col),
    });
    console.log(`  + columna ${col.name}`);
  } catch (e) {
    if (String(e.message).includes("409") || String(e.message).includes("already")) {
      console.log(`  = columna ${col.name} ya existe`);
      return;
    }
    throw e;
  }
}

async function ensureList(tok, displayName, columns) {
  let list = await findList(tok, displayName);
  if (!list) {
    list = await graph(tok, `/sites/${siteId}/lists`, {
      method: "POST",
      body: JSON.stringify({
        displayName,
        list: { template: "genericList" },
      }),
    });
    console.log(`Creada lista "${displayName}" → ${list.id}`);
  } else {
    console.log(`Lista "${displayName}" ya existe → ${list.id}`);
  }
  for (const col of columns) await ensureColumn(tok, list.id, col);
  return list.id;
}

const text = (name, displayName) => ({
  name,
  displayName,
  text: {},
});
const numberCol = (name, displayName) => ({
  name,
  displayName,
  number: {},
});
const dateTime = (name, displayName) => ({
  name,
  displayName,
  dateTime: { format: "dateTime" },
});

const tok = await token();

const parametrosId = await ensureList(tok, "Parametros Cotizador", [
  text("Valor", "Valor"),
  text("Tipo", "Tipo"),
  text("Grupo", "Grupo"),
  text("Descripcion", "Descripcion"),
]);

const cotizacionesId = await ensureList(tok, "Cotizaciones Cotizador", [
  text("LoteId", "LoteId"),
  text("IdLote", "IdLote"),
  text("ClienteNombre", "ClienteNombre"),
  text("ClienteCC", "ClienteCC"),
  text("ClienteEmail", "ClienteEmail"),
  text("VendedorNombre", "VendedorNombre"),
  text("VendedorEmail", "VendedorEmail"),
  numberCol("Porcentaje", "Porcentaje"),
  numberCol("Cuotas", "Cuotas"),
  numberCol("ValorPreventa", "ValorPreventa"),
  dateTime("Fecha", "Fecha"),
  text("Referido", "Referido"),
]);

console.log("\nConfigura en el entorno / env.ts:");
console.log(`SP_PARAMETROS_LIST_ID=${parametrosId}`);
console.log(`SP_COTIZACIONES_LIST_ID=${cotizacionesId}`);
console.log(
  "\nEn la lista Vendedores Cotizador, usa Rol = Administrador para el panel y estadísticas.",
);
