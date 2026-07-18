import logo from "@/assets/logo_blanco.png";
import { useEffect, useState } from "react";

const NAV = [
  { id: "inicio", label: "Inicio" },
  { id: "nosotros", label: "Nosotros" },
  { id: "servicios", label: "Servicios" },
  { id: "sectores", label: "Sectores" },
  { id: "diferenciales", label: "Diferenciales" },
  { id: "proyectos", label: "Proyectos" },
  { id: "cobertura", label: "Cobertura" },
  { id: "contacto", label: "Contacto" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "bg-white/95 backdrop-blur border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container-tf flex items-center justify-between h-18 py-3">
        <button
          onClick={() => go("inicio")}
          className="flex items-center gap-2 shrink-0"
          aria-label="TERRA FORMING inicio"
        >
          <img src={logo} alt="TERRA FORMING" className="h-11 w-auto" width={160} height={44} />
        </button>

        <nav className="hidden lg:flex items-center gap-7">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className={`text-sm font-medium tracking-wide transition-colors hover:text-brand-orange ${
                scrolled ? "text-brand-navy" : "text-white"
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="hidden lg:block">
          <button
            onClick={() => go("contacto")}
            className="inline-flex items-center rounded-md bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 hover:shadow-md"
          >
            Solicitar propuesta
          </button>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className={`lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-md ${
            scrolled || open ? "text-brand-navy" : "text-white"
          }`}
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

      {open && (
        <div className="lg:hidden border-t border-border bg-white">
          <div className="container-tf py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className="text-left py-3 px-2 text-brand-navy font-medium rounded hover:bg-brand-gray"
              >
                {n.label}
              </button>
            ))}
            <button
              onClick={() => go("contacto")}
              className="mt-2 rounded-md bg-brand-orange px-5 py-3 text-sm font-semibold text-white"
            >
              Solicitar propuesta
            </button>
          </div>
        </div>
      )}
    </header>
  );
}