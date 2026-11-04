import { captureCampaignFromLocation, persistSelectedLot } from "@/lib/terra/campaign";
import { normalizeLotId } from "@/lib/terra/lots";
import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

export function CampaignCapture() {
  const location = useRouterState({ select: (state) => state.location });

  useEffect(() => {
    if (typeof window === "undefined") return;
    captureCampaignFromLocation(window.location.search, location.pathname, window.sessionStorage);
    const lote = new URLSearchParams(window.location.search).get("lote");
    if (lote) persistSelectedLot(normalizeLotId(lote), window.sessionStorage);
  }, [location.pathname, location.search]);

  return null;
}
