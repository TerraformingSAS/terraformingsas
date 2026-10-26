// Vendedores autorizados: lista SharePoint "Vendedores Cotizador" (Portal Cliente Terra).
import { graph } from "./graph.js";
import { env } from "./env.js";
export type Sesion = { email: string; nombre: string; rol: string };

type Item = { fields: Record<string, unknown> };

export async function buscarVendedor(email: string): Promise<Sesion | null> {
  const correo = email.trim().toLowerCase();
  let url: string | undefined =
    `/sites/${env("SP_SITE_ID")}/lists/${env("SP_VENDEDORES_LIST_ID")}/items?expand=fields(select=Title,Correo,Activo,Rol)&$top=200`;
  while (url) {
    const r: { value: Item[]; "@odata.nextLink"?: string } = await graph(url);
    const f = r.value
      .map((i) => i.fields)
      .find(
        (x) =>
          String(x.Correo ?? "")
            .trim()
            .toLowerCase() === correo,
      );
    if (f)
      return f.Activo === true
        ? { email: correo, nombre: String(f.Title ?? correo), rol: String(f.Rol ?? "Vendedor") }
        : null;
    url = r["@odata.nextLink"]?.replace("https://graph.microsoft.com/v1.0", "");
  }
  return null;
}
