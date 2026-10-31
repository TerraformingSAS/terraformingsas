// Lectura/escritura de parámetros en lista SharePoint "Parametros Cotizador".
import { graph } from "./graph.js";
import { env, envOptional } from "./env.js";
import {
  PARAMETROS_DEFAULT,
  PARAMETROS_SEED,
  itemsDesdeParametros,
  parametrosDesdeItems,
  type ParametroItem,
  type ParametrosCotizador,
} from "../../../features/terra-cotizador/lib/parametros.js";

type SpItem = {
  id: string;
  fields: Record<string, unknown>;
};

function listId(): string {
  return envOptional("SP_PARAMETROS_LIST_ID").trim();
}

function site(): string {
  return env("SP_SITE_ID");
}

async function listarItemsSp(): Promise<ParametroItem[]> {
  const id = listId();
  if (!id) return [];
  const out: ParametroItem[] = [];
  let url: string | undefined =
    `/sites/${site()}/lists/${id}/items?expand=fields(select=Title,Valor,Tipo,Grupo,Descripcion)&$top=200`;
  while (url) {
    const r: { value: SpItem[]; "@odata.nextLink"?: string } = await graph(url);
    for (const row of r.value) {
      const f = row.fields;
      const clave = String(f.Title ?? "").trim();
      if (!clave) continue;
      out.push({
        id: String(row.id),
        clave,
        valor: String(f.Valor ?? ""),
        tipo: (String(f.Tipo ?? "texto") as ParametroItem["tipo"]) || "texto",
        grupo: (String(f.Grupo ?? "calculo") as ParametroItem["grupo"]) || "calculo",
        descripcion: String(f.Descripcion ?? ""),
      });
    }
    url = r["@odata.nextLink"]?.replace("https://graph.microsoft.com/v1.0", "");
  }
  return out;
}

/** Fusiona seed + SharePoint (SP gana por clave). */
export function fusionarItems(sp: ParametroItem[]): ParametroItem[] {
  const byClave = new Map(sp.map((i) => [i.clave, i]));
  return PARAMETROS_SEED.map((seed) => {
    const hit = byClave.get(seed.clave);
    return hit
      ? { ...seed, ...hit, clave: seed.clave, tipo: seed.tipo, grupo: seed.grupo, descripcion: seed.descripcion }
      : { ...seed };
  });
}

export async function leerParametros(): Promise<{
  parametros: ParametrosCotizador;
  items: ParametroItem[];
  fuente: "sharepoint" | "defaults";
}> {
  try {
    const sp = await listarItemsSp();
    if (sp.length === 0) {
      return {
        parametros: PARAMETROS_DEFAULT,
        items: itemsDesdeParametros(PARAMETROS_DEFAULT),
        fuente: "defaults",
      };
    }
    const items = fusionarItems(sp);
    return {
      parametros: parametrosDesdeItems(items),
      items,
      fuente: "sharepoint",
    };
  } catch (e) {
    console.error("parametros: fallback defaults", e);
    return {
      parametros: PARAMETROS_DEFAULT,
      items: itemsDesdeParametros(PARAMETROS_DEFAULT),
      fuente: "defaults",
    };
  }
}

export async function guardarParametros(
  updates: { clave: string; valor: string }[],
): Promise<{ ok: true; items: ParametroItem[] } | { ok: false; error: string }> {
  const id = listId();
  if (!id) {
    return {
      ok: false,
      error:
        "Falta SP_PARAMETROS_LIST_ID. Crea la lista Parametros Cotizador y configura el ID.",
    };
  }

  const actual = await listarItemsSp();
  const byClave = new Map(actual.map((i) => [i.clave, i]));
  const seedByClave = new Map(PARAMETROS_SEED.map((s) => [s.clave, s]));

  for (const u of updates) {
    const clave = u.clave.trim();
    if (!clave) continue;
    const seed = seedByClave.get(clave);
    if (!seed) continue;
    const valor = String(u.valor ?? "");
    const existente = byClave.get(clave);
    if (existente?.id) {
      await graph(`/sites/${site()}/lists/${id}/items/${existente.id}/fields`, {
        method: "PATCH",
        body: JSON.stringify({ Valor: valor }),
      });
    } else {
      await graph(`/sites/${site()}/lists/${id}/items`, {
        method: "POST",
        body: JSON.stringify({
          fields: {
            Title: clave,
            Valor: valor,
            Tipo: seed.tipo,
            Grupo: seed.grupo,
            Descripcion: seed.descripcion,
          },
        }),
      });
    }
  }

  const { items } = await leerParametros();
  return { ok: true, items };
}
