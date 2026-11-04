import { TerraMark } from "@/components/terra/TerraMark";
import { WhatsAppIcon } from "@/components/terra/icons";
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

  const navHref = (id: string, href: string) => (onLanding ? `#${id}` : href);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        showSolid ? "border-b border-border bg-white shadow-sm" : "bg-transparent",
      )}
    >
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-brand-navy"
      >
        Saltar al contenido
      </a>
      <div className="container-tf flex h-[4.5rem] items-center gap-3 py-3 sm:h-20">
        <Link
          to="/terra"
          className="min-w-0 shrink-0"
          aria-label="TERRA, proyecto de TERRA FORMING S.A.S."
        >
          <TerraMark light={!showSolid} />
          <span className="sr-only">{TERRA_PROJECT.company}</span>
        </Link>

        <nav
          className="ml-auto hidden items-center gap-5 xl:gap-6 lg:flex"
          aria-label="Navegación del proyecto TERRA"
        >
          {TERRA_NAV.map((item) => (
            <a
              key={item.id}
              href={navHref(item.id, item.href)}
              className={cn(
                "text-[13px] font-medium tracking-wide transition-colors hover:text-brand-orange",
                showSolid ? "text-brand-navy" : "text-white",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-4">
          <a
            href={TERRA_PROJECT.explorerPath}
            className="inline-flex min-h-10 items-center rounded-md bg-brand-orange px-3 text-xs font-semibold text-white sm:min-h-11 sm:px-4 sm:text-sm"
          >
            Explorar lotes
          </a>
          <a
            href={terraWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackTerraEvent("whatsapp_click", { location: "header" })}
            className={cn(
              "inline-flex min-h-10 min-w-10 items-center justify-center gap-2 rounded-md border px-2.5 text-xs font-semibold sm:min-h-11 sm:px-3 sm:text-sm",
              showSolid ? "border-brand-navy/15 text-brand-navy" : "border-white/40 text-white",
            )}
            aria-label="Cotizar por WhatsApp"
          >
            <WhatsAppIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Cotizar por WhatsApp</span>
          </a>
          <button
            type="button"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-md lg:hidden",
              showSolid ? "text-brand-navy" : "text-white",
            )}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {open ? (
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M4 7h16" strokeLinecap="round" />
                  <path d="M4 12h16" strokeLinecap="round" />
                  <path d="M4 17h16" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-white lg:hidden">
          <nav className="container-tf flex flex-col py-3" aria-label="Menú del proyecto TERRA">
            {TERRA_NAV.map((item) => (
              <a
                key={item.id}
                href={navHref(item.id, item.href)}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-brand-navy hover:bg-brand-cream"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
