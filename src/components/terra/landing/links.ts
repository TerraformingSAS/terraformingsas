import { persistSelectedLot } from "@/lib/terra/campaign";
import { TERRA_PROJECT } from "@/lib/terra/commercial";
import { normalizeLotId } from "@/lib/terra/lots";

/** Enlace al cotizador vigente. El portal lee `?lote=` y la sesión; no se altera su motor. */
export function cotizadorHref(lotId?: string): string {
  const id = lotId ? normalizeLotId(lotId) : "";
  if (!id) return TERRA_PROJECT.cotizadorPath;
  return `${TERRA_PROJECT.cotizadorPath}?lote=${encodeURIComponent(id)}`;
}

export function rememberLot(lotId?: string) {
  const id = lotId ? normalizeLotId(lotId) : "";
  if (!id || typeof window === "undefined") return;
  persistSelectedLot(id, window.sessionStorage);
}
