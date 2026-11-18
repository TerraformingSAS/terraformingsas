import { persistSelectedLot } from "@/lib/terra/campaign";
import { normalizeLotId } from "@/lib/terra/lots";

export const TERRA_SIMULATOR_EVENT = "terra-open-simulator";

export function openPublicSimulator() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TERRA_SIMULATOR_EVENT));
}

export function rememberLot(lotId?: string) {
  const id = lotId ? normalizeLotId(lotId) : "";
  if (!id || typeof window === "undefined") return;
  persistSelectedLot(id, window.sessionStorage);
}
