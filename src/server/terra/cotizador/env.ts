const defaults: Record<string, string> = {
  AZURE_TENANT_ID: "bfcc0776-5e02-48ae-a562-ccdd5f4b9ea0",
  AZURE_CLIENT_ID: "e18448a3-4c7b-40de-bf19-cfef44256606",
  SP_SITE_ID:
    "intelecto1.sharepoint.com,e13795b1-6624-4274-9b96-247d755df923,c5470bdd-ca53-41ef-a9f0-b0548bd5da7f",
  SP_VENDEDORES_LIST_ID: "d7c660e1-2b3f-4f09-9b00-36e42bf2f0c6",
  PRECIOS_DRIVE_ID: "b!sZU34SRmdEKbliR9dV35I90LR8VTyu9BqfCwVIvV2n-dkUiHD4vMT7gLhpvaurQJ",
  PRECIOS_ITEM_ID: "014W35K5NBNGKYVUUC2FBI5WLTKZZCI7HQ",
  PRECIOS_TABLE: "TablaPreciosPreVenta",
  MAIL_SENDER: "notifica@intelecto.co",
  MAPA_DRIVE_ID: "b!sZU34SRmdEKbliR9dV35I90LR8VTyu9BqfCwVIvV2n-dkUiHD4vMT7gLhpvaurQJ",
  MAPA_ITEM_ID: "014W35K5K6SJTWTYLTGBBJ3SAO4DNDFQ5M",
  MAPA_TABLE: "TablaLotes",
};

const aliases: Record<string, string> = {
  AZURE_TENANT_ID: "MS_TENANT_ID",
  AZURE_CLIENT_ID: "MS_CLIENT_ID",
  AZURE_CLIENT_SECRET: "MS_CLIENT_SECRET",
};

export function env(name: string): string {
  const v = process.env[name] ?? process.env[aliases[name] ?? ""] ?? defaults[name];
  if (!v) throw new Error(`Falta la variable de entorno ${name}`);
  return v;
}
