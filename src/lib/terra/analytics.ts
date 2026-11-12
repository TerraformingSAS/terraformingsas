const PII_KEYS = /email|correo|phone|telefono|whatsapp|nombre|name|cedula|documento|cc\b/i;

export const TERRA_WEB_EVENTS = [
  "page_view",
  "explore_lots",
  "select_lot",
  "view_quote",
  "select_financing_plan",
  "form_start",
  "request_quote",
  "generate_lead",
  "whatsapp_click",
  "contact_click",
  "search",
] as const;

export type TerraWebEvent = (typeof TERRA_WEB_EVENTS)[number];

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

function sanitizeParams(params: AnalyticsParams = {}): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || PII_KEYS.test(key)) continue;
    if (typeof value === "string") out[key] = value.slice(0, 120);
    else out[key] = value;
  }
  return out;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const once = new Set<string>();

type PixelParams = Record<string, string | number | boolean | string[]>;

function lotIds(payload: Record<string, string | number | boolean>): string[] | undefined {
  const id = payload.lot_id;
  if (typeof id !== "string" || !id || id === "sin_lote") return undefined;
  return [id];
}

function withValue(payload: Record<string, string | number | boolean>, params: PixelParams): PixelParams {
  const value = payload.value;
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return { ...params, value, currency: "COP" };
  }
  return params;
}

/** Standard events that match a real action. Purchase is omitted: there is no payment confirmation. */
export function metaPixelCalls(
  event: TerraWebEvent,
  payload: Record<string, string | number | boolean>,
): Array<{ method: "track" | "trackCustom"; name: string; params: PixelParams }> {
  const ids = lotIds(payload);
  const category = typeof payload.location === "string" ? payload.location : "terra";
  const contentIds = ids ? { content_ids: ids, content_type: "product" as const } : {};
  const calls: Array<{ method: "track" | "trackCustom"; name: string; params: PixelParams }> = [];

  if (event === "select_lot" || event === "view_quote" || event === "explore_lots") {
    const contentName =
      event === "select_lot"
        ? String(payload.lot_id ?? "Lote TERRA")
        : event === "view_quote"
          ? "Cotización TERRA"
          : "Inventario TERRA";
    calls.push({
      method: "track",
      name: "ViewContent",
      params: withValue(payload, {
        content_name: contentName,
        content_category: event === "explore_lots" ? "inventory" : category,
        ...contentIds,
      }),
    });
  } else if (event === "search") {
    calls.push({
      method: "track",
      name: "Search",
      params: {
        search_string: String(payload.search_string ?? "").slice(0, 120),
        content_category: category,
        ...(ids ? { content_ids: ids } : {}),
      },
    });
  } else if (event === "generate_lead") {
    calls.push({
      method: "track",
      name: "Lead",
      params: withValue(payload, {
        content_name: "TERRA",
        content_category: typeof payload.method === "string" ? payload.method : "quote_request",
        ...contentIds,
      }),
    });
  } else if (event === "whatsapp_click" || event === "contact_click") {
    calls.push({
      method: "track",
      name: "Contact",
      params: {
        content_name: event === "whatsapp_click" ? "WhatsApp" : String(payload.channel ?? "contacto"),
        content_category: category,
      },
    });
  } else if (event === "select_financing_plan") {
    calls.push({
      method: "track",
      name: "CustomizeProduct",
      params: {
        content_name: String(payload.plan ?? "financiacion"),
        content_category: "financing",
        ...contentIds,
      },
    });
  }

  calls.push({ method: "trackCustom", name: event, params: payload });
  return calls;
}

export function trackTerraEvent(
  event: TerraWebEvent,
  params: AnalyticsParams = {},
  options: { onceKey?: string } = {},
) {
  if (typeof window === "undefined") return;
  if (options.onceKey) {
    if (once.has(options.onceKey)) return;
    once.add(options.onceKey);
  }
  const payload = sanitizeParams(params);
  window.gtag?.("event", event, payload);
  for (const call of metaPixelCalls(event, payload)) {
    window.fbq?.(call.method, call.name, call.params);
  }
  if (typeof window.clarity === "function") {
    if (event === "select_lot" || event === "generate_lead" || event === "form_start") {
      window.clarity("event", `terra_${event}`);
    }
  }
}

const PAGE_CONTENT: Record<string, { name: string; category: string; findLocation?: boolean }> = {
  "/": { name: "Inicio TERRA FORMING", category: "corporate" },
  "/terra": { name: "TERRA Etapa I", category: "project" },
  "/terra/mapa": { name: "Mapa de lotes TERRA", category: "location", findLocation: true },
  "/terra/estado": { name: "Disponibilidad de lotes TERRA", category: "inventory" },
  "/terra/cotizador": { name: "Cotizador TERRA", category: "quote" },
};

export function trackMetaPageContent(pathname: string) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  const page = PAGE_CONTENT[pathname];
  if (!page) return;
  window.fbq("track", "ViewContent", {
    content_name: page.name,
    content_category: page.category,
    content_type: "product_group",
  });
  if (page.findLocation) {
    window.fbq("track", "FindLocation", { content_name: page.name, content_category: "map" });
  }
}

export function resetAnalyticsOnceKeys() {
  once.clear();
}
