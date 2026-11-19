function statusKey(estado: string): string {
  return estado
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "_");
}

/** Un lote vendido o no disponible no admite cotización. */
export function isQuoteBlocked(estado: string): boolean {
  const key = statusKey(estado);
  return key === "vendido" || key === "no_disponible";
}

/** Reservado o en negociación sí se cotizan, con aviso. */
export function quoteStatusNote(estado: string): string {
  const key = statusKey(estado);
  if (key === "reservado") {
    return "Este lote está reservado. La cotización es informativa y no garantiza disponibilidad.";
  }
  if (key === "negociacion" || key === "en_negociacion") {
    return "Este lote está en negociación. La cotización es informativa y no garantiza disponibilidad.";
  }
  return "";
}
