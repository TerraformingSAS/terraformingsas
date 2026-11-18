import { terraWhatsAppUrl } from "@/lib/terra/contact";
import { trackTerraEvent } from "@/lib/terra/analytics";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const NAV = [
  { id: "proyecto", label: "Proyecto" },
  { id: "lotes", label: "Lotes" },
  { id: "financiacion", label: "Financiación" },
  { id: "ubicacion", label: "Ubicación" },
  { id: "contacto", label: "Contacto" },
] as const;

export function LandingHeader() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const ink = solid || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        ink
          ? "bg-white/95 shadow-[0_8px_30px_rgba(14,42,71,0.08)] backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-brand-navy"
      >
        Saltar al contenido
      </a>
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center gap-3 px-4 sm:px-6">
        <Link to="/terra" className="inline-flex items-center gap-2" aria-label="TERRA Etapa I">
          <img
            src={ink ? "/terra/estado/logo-color.png" : "/terra/estado/logo-terraforming.png"}
            alt="TERRA FORMING"
            width={300}
            height={83}
            className="h-8 w-auto sm:h-9"
          />
          <span
            className={cn(
              "hidden text-[12px] font-bold tracking-[0.22em] sm:inline",
              ink ? "text-brand-navy" : "text-white",
            )}
          >
            TERRA
          </span>
        </Link>

        <nav
          className="ml-auto hidden items-center gap-6 lg:flex"
          aria-label="Recorrido comercial de TERRA"
        >
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "text-[13px] font-medium transition-colors hover:text-brand-orange",
                ink ? "text-brand-navy" : "text-white",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-6">
          <a
            href={terraWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackTerraEvent("whatsapp_click", { location: "header" })}
            className={cn(
              "hidden rounded-full px-4 py-2 text-[13px] font-semibold transition sm:inline-flex",
              ink
                ? "bg-[#25D366] text-white hover:brightness-105"
                : "bg-white/15 text-white ring-1 ring-white/40 hover:bg-white/25",
            )}
          >
            WhatsApp
          </a>
          <a
            href="#contacto"
            onClick={() => trackTerraEvent("view_quote", { location: "header" })}
            className="hidden rounded-full bg-brand-orange px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:brightness-110 sm:inline-flex"
          >
            Cotiza tu lote
          </a>
          <button
            type="button"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full lg:hidden",
              ink ? "text-brand-navy" : "text-white",
            )}
            aria-expanded={open}
            aria-controls="terra-landing-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
            <span className="flex w-5 flex-col gap-1.5" aria-hidden>
              <span
                className={cn("h-0.5 bg-current transition", open && "translate-y-2 rotate-45")}
              />
              <span className={cn("h-0.5 bg-current transition", open && "opacity-0")} />
              <span
                className={cn("h-0.5 bg-current transition", open && "-translate-y-2 -rotate-45")}
              />
            </span>
          </button>
        </div>
      </div>
      {open ? (
        <nav
          id="terra-landing-menu"
          className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden"
          aria-label="Menú móvil"
        >
          <ul className="grid gap-1">
            {NAV.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 text-base font-medium text-brand-navy hover:bg-brand-cream"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
