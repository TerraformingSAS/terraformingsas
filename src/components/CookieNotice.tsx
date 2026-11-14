import { trackMetaPageContent } from "@/lib/terra/analytics";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useId, useState } from "react";

type ConsentApi = {
  read: () => string | null;
  grant: () => void;
  deny: () => void;
  trackPage: () => void;
};

function consentApi(): ConsentApi | null {
  return window.TerraConsent ?? null;
}

export function CookieNotice() {
  const titleId = useId();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setOpen(consentApi()?.read() == null);
    sync();
    const openPreferences = () => setOpen(true);
    window.addEventListener("terra-consent", sync);
    window.addEventListener("terra-cookie-open", openPreferences);
    return () => {
      window.removeEventListener("terra-consent", sync);
      window.removeEventListener("terra-cookie-open", openPreferences);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] p-4 sm:p-6 pointer-events-none">
      <section
        role="dialog"
        aria-labelledby={titleId}
        className="pointer-events-auto ml-auto w-full max-w-md rounded-2xl border border-brand-navy/10 bg-white p-5 text-brand-navy shadow-[0_16px_50px_rgba(14,42,71,0.22)]"
      >
        <h2 id={titleId} className="font-display text-base font-bold">
          Cookies de medición
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-brand-dark/80">
          Google Analytics, Microsoft Clarity y el píxel de Meta miden las visitas y la
          publicidad. Solo se activan si lo autorizas.{" "}
          <a className="underline underline-offset-4 hover:text-brand-orange" href="/politica-de-privacidad">
            Política de privacidad
          </a>
        </p>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-brand-navy/15 px-4 py-2 text-sm font-semibold"
            onClick={() => consentApi()?.deny()}
          >
            Rechazar
          </button>
          <button
            type="button"
            className="rounded-md bg-brand-orange px-4 py-2 text-sm font-semibold text-white"
            onClick={() => {
              consentApi()?.grant();
              trackMetaPageContent(pathname);
            }}
          >
            Aceptar
          </button>
        </div>
      </section>
    </div>
  );
}

declare global {
  interface Window {
    TerraConsent?: ConsentApi;
  }
}
