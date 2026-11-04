export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type UtmParams = Partial<Record<UtmKey, string>>;

export type CampaignAttribution = {
  first: UtmParams;
  last: UtmParams;
  landingPage?: string;
};

export const TERRA_STORAGE = {
  first: "terra_campaign_first",
  last: "terra_campaign_last",
  landing: "terra_campaign_landing",
  lot: "terra_selected_lot",
  plan: "terra_financing_plan",
} as const;

const MAX_VALUE = 180;

export function parseUtmSearch(search: string): UtmParams {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  const out: UtmParams = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) out[key] = value.slice(0, MAX_VALUE);
  }
  return out;
}

export function hasUtm(params: UtmParams | null | undefined): boolean {
  if (!params) return false;
  return UTM_KEYS.some((key) => Boolean(params[key]));
}

export function mergeAttribution(
  existingFirst: UtmParams | undefined,
  incoming: UtmParams,
  existingLast?: UtmParams,
): CampaignAttribution {
  const first = hasUtm(existingFirst) ? (existingFirst as UtmParams) : incoming;
  const last = hasUtm(incoming) ? incoming : (existingLast ?? existingFirst ?? {});
  return { first, last };
}

export function readJson<T>(storage: Pick<Storage, "getItem">, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(storage: Pick<Storage, "setItem">, key: string, value: unknown) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / quota */
  }
}

export function captureCampaignFromLocation(
  search: string,
  pathname: string,
  storage?: Pick<Storage, "getItem" | "setItem"> | null,
): CampaignAttribution {
  const incoming = parseUtmSearch(search);
  const existingFirst = storage ? readJson<UtmParams>(storage, TERRA_STORAGE.first) : null;
  const existingLast = storage ? readJson<UtmParams>(storage, TERRA_STORAGE.last) : null;
  const merged = mergeAttribution(existingFirst ?? undefined, incoming, existingLast ?? undefined);
  if (storage) {
    if (hasUtm(merged.first) && !hasUtm(existingFirst ?? undefined)) {
      writeJson(storage, TERRA_STORAGE.first, merged.first);
    }
    if (hasUtm(merged.last)) writeJson(storage, TERRA_STORAGE.last, merged.last);
    const existingLanding = storage.getItem(TERRA_STORAGE.landing);
    if (!existingLanding && pathname)
      storage.setItem(TERRA_STORAGE.landing, pathname.slice(0, MAX_VALUE));
  }
  return {
    ...merged,
    landingPage: storage?.getItem(TERRA_STORAGE.landing) || pathname,
  };
}

export function readAttribution(storage?: Pick<Storage, "getItem"> | null): CampaignAttribution {
  if (!storage) return { first: {}, last: {} };
  return {
    first: readJson<UtmParams>(storage, TERRA_STORAGE.first) ?? {},
    last: readJson<UtmParams>(storage, TERRA_STORAGE.last) ?? {},
    landingPage: storage.getItem(TERRA_STORAGE.landing) ?? undefined,
  };
}

export function persistSelectedLot(lotId: string, storage?: Pick<Storage, "setItem"> | null) {
  if (!storage || !lotId) return;
  try {
    storage.setItem(TERRA_STORAGE.lot, lotId.slice(0, 32));
  } catch {
    /* ignore */
  }
}

export function readSelectedLot(storage?: Pick<Storage, "getItem"> | null): string {
  if (!storage) return "";
  return storage.getItem(TERRA_STORAGE.lot)?.trim() ?? "";
}

export function persistFinancingPlan(plan: string, storage?: Pick<Storage, "setItem"> | null) {
  if (!storage || !plan) return;
  try {
    storage.setItem(TERRA_STORAGE.plan, plan.slice(0, 40));
  } catch {
    /* ignore */
  }
}

export function readFinancingPlan(storage?: Pick<Storage, "getItem"> | null): string {
  if (!storage) return "";
  return storage.getItem(TERRA_STORAGE.plan)?.trim() ?? "";
}

export function attributionFormFields(attribution: CampaignAttribution): Record<string, string> {
  const first = attribution.first;
  const last = attribution.last;
  return {
    utm_source: first.utm_source || last.utm_source || "",
    utm_medium: first.utm_medium || last.utm_medium || "",
    utm_campaign: first.utm_campaign || last.utm_campaign || "",
    utm_content: first.utm_content || last.utm_content || "",
    utm_term: first.utm_term || last.utm_term || "",
    origen_campana: first.utm_campaign || last.utm_campaign || "",
    medio: first.utm_medium || last.utm_medium || "",
    nombre_campana: first.utm_campaign || last.utm_campaign || "",
    anuncio: first.utm_content || last.utm_content || "",
    utm_source_last: last.utm_source || "",
    utm_medium_last: last.utm_medium || "",
    utm_campaign_last: last.utm_campaign || "",
  };
}
