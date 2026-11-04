import { TERRA_NAV, TERRA_PROJECT } from "@/lib/terra/commercial";
import { terraWhatsAppUrl } from "@/lib/terra/contact";
import { trackTerraEvent } from "@/lib/terra/analytics";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function TerraHeader({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const onLanding = pathname === "/terra";
  const showSolid = solid || scrolled || open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navHref = (id: string, href: string) => (onLanding ? `#${id}` : href);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background,box-shadow] duration-300",
        showSolid
          ? "border-b border-[#e5e9ec] bg-white shadow-[0_3px_16px_rgba(14,42,71,0.1)]"
          : "bg-transparent",
      )}
    >
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-brand-navy"
      >
        Saltar al contenido
      </a>
      <div className="mx-auto flex h-[68px] max-w-[1240px] items-center gap-3 px-3 sm:h-[72px] sm:px-5">
        <Link
          to="/terra"
          className="relative inline-flex shrink-0 items-center gap-2.5"
          aria-label="TERRA, proyecto de TERRA FORMING S.A.S."
        >
          <img
            src="/terra/estado/logo-terraforming.png"
            alt="TERRA FORMING"
            width={300}
            height={83}
            className={cn("h-8 w-auto object-contain sm:h-9", showSolid && "opacity-0")}
          />
          <img
            src="/terra/estado/logo-color.png"
            alt=""
            aria-hidden
            width={300}
            height={83}
            className={cn(
              "absolute left-0 h-8 w-auto object-contain sm:h-9",
              showSolid ? "opacity-100" : "opacity-0",
            )}
          />
          <span
            className={cn(
              "hidden font-display text-[13px] font-bold leading-none tracking-[0.2em] min-[761px]:inline",
              showSolid ? "text-brand-navy" : "text-white",
            )}
          >
            TERRA
          </span>
        </Link>

        <nav
          className="ml-auto hidden items-center gap-[clamp(10px,1.4vw,22px)] min-[1024px]:flex"
          aria-label="Navegación del proyecto TERRA"
        >
          {TERRA_NAV.map((item) => (
            <a
              key={item.id}
              href={navHref(item.id, item.href)}
              className={cn(
                "whitespace-nowrap text-[13px] font-medium tracking-[0.015em] transition-colors hover:text-brand-orange",
                showSolid ? "text-brand-navy" : "text-white",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 min-[1024px]:ml-3">
          <a
            href={TERRA_PROJECT.explorerPath}
            className="inline-flex items-center justify-center rounded-md bg-brand-orange px-4 py-2.5 text-[13px] font-bold leading-snug text-white"
          >
            Explorar lotes
          </a>
          <a
            href={terraWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackTerraEvent("whatsapp_click", { location: "header" })}
            className={cn(
              "inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-xs font-semibold max-[760px]:w-10 max-[760px]:border-0 max-[760px]:bg-[#25D366] max-[760px]:px-0 max-[760px]:text-[10px] max-[760px]:font-extrabold max-[760px]:text-white",
              showSolid
                ? "border-[#d7dee5] text-brand-navy max-[760px]:border-0 max-[760px]:text-white"
                : "border-white/40 text-white",
            )}
          >
            <span className="max-[760px]:hidden">Cotizar por WhatsApp</span>
            <span className="hidden max-[760px]:inline">WA</span>
          </a>
          <button
            type="button"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-md min-[1024px]:hidden",
              showSolid ? "text-brand-navy" : "text-white",
            )}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="terra-mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="terra-mobile-nav"
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-[#e2e8f0] bg-white shadow-[0_12px_24px_rgba(14,42,71,0.12)] min-[1024px]:hidden"
          aria-label="Navegación móvil"
        >
          <div className="mx-auto flex max-w-[1240px] flex-col gap-0.5 px-5 py-4">
            {TERRA_NAV.map((item) => (
              <a
                key={item.id}
                href={navHref(item.id, item.href)}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-brand-navy"
              >
                {item.label}
              </a>
            ))}
            <a
              href={TERRA_PROJECT.explorerPath}
              className="mt-2.5 inline-flex items-center justify-center rounded-md bg-brand-orange px-4 py-2.5 text-[13px] font-bold text-white"
            >
              Explorar lotes
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
