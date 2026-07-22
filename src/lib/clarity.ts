import Clarity from "@microsoft/clarity";

const FALLBACK_CLARITY_PROJECT_ID = "xohkyd8a2m";
const clarityProjectId =
  import.meta.env.VITE_CLARITY_PROJECT_ID ?? FALLBACK_CLARITY_PROJECT_ID;

let hasInitializedClarity = false;

export function initClarity() {
  if (typeof window === "undefined") return;
  if (hasInitializedClarity) return;
  if (!clarityProjectId) return;

  Clarity.init(clarityProjectId);
  hasInitializedClarity = true;
}
