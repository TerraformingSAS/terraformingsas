import { useEffect, useState } from "react";

type ConsentApi = {
  noticeDismissed: () => boolean;
  dismissNotice: () => void;
  trackPage: () => void;
};

function consentApi(): ConsentApi | null {
  return window.TerraConsent ?? null;
}

export function CookieNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setOpen(!consentApi()?.noticeDismissed());
    sync();
    const openNotice = () => setOpen(true);
    window.addEventListener("terra-cookie-dismiss", sync);
    window.addEventListener("terra-cookie-open", openNotice);
    return () => {
      window.removeEventListener("terra-cookie-dismiss", sync);
      window.removeEventListener("terra-cookie-open", openNotice);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="pointer-events-none fixed bottom-3 left-3 z-[80] max-w-[min(260px,calc(100%-1.5rem))]">
      <p className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-white py-1 pl-3 pr-1 text-[11px] leading-tight text-brand-navy shadow-[0_8px_24px_rgba(14,42,71,0.18)]">
        <span>Al visitar este sitio aceptas el uso de cookies.</span>
        <button
          type="button"
          aria-label="Cerrar"
          className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-base leading-none text-brand-navy/70 hover:bg-brand-navy/5 hover:text-brand-navy"
          onClick={() => consentApi()?.dismissNotice()}
        >
          ×
        </button>
      </p>
    </div>
  );
}

declare global {
  interface Window {
    TerraConsent?: ConsentApi;
  }
}
