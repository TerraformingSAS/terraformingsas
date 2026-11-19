/** Formato colombiano de miles para campos de dinero editables. */
export function formatMiles(value: number | ""): string {
  if (value === "" || !Number.isFinite(value)) return "";
  return Math.round(value).toLocaleString("es-CO");
}

export function parseMiles(raw: string): number | "" {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  const n = Number(digits);
  return Number.isFinite(n) ? n : "";
}

export function milesInputValue(raw: string): string {
  const parsed = parseMiles(raw);
  return parsed === "" ? "" : formatMiles(parsed);
}
