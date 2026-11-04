const PII_KEYS = /email|correo|phone|telefono|whatsapp|nombre|name|cedula|documento|cc\b/i;

export const TERRA_WEB_EVENTS = [
  "page_view",
  "select_lot",
  "view_quote",
  "select_financing_plan",
  "form_start",
  "request_quote",
  "generate_lead",
  "whatsapp_click",
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
  if (event === "generate_lead") {
    window.fbq?.("track", "Lead", { content_name: "TERRA", content_category: "quote_request" });
  }
  if (typeof window.clarity === "function") {
    if (event === "select_lot" || event === "generate_lead" || event === "form_start") {
      window.clarity("event", `terra_${event}`);
    }
  }
}

export function resetAnalyticsOnceKeys() {
  once.clear();
}
