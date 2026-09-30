import heroImg from "@/assets/hero.jpg";
import { useNavigate, useRouterState } from "@tanstack/react-router";

export function Hero() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onHome = pathname === "/";

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (onHome && el) {
      el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    void navigate({ to: "/", hash: id });
  };

  return (
    <section id="inicio" className="relative min-h-screen w-full overflow-hidden">
      <img
        src={heroImg}
        alt="Infraestructura vial en construcción en Colombia"
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1088}
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0E2A47]/90 via-[#0E2A47]/70 to-[#0E2A47]/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E2A47]/80 to-transparent" />

      <div className="relative container-tf flex min-h-screen flex-col justify-center pt-28 pb-20 text-white">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 backdrop-blur px-4 py-1.5 text-[11px] font-semibold tracking-[0.18em] uppercase text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
            Ingeniería • Construcción • Infraestructura
          </div>

          <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            Construimos infraestructura que
            <span className="text-brand-orange"> impulsa el desarrollo</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg text-white/85 leading-relaxed">
            Soluciones integrales en obras civiles, urbanismo e infraestructura
            para proyectos públicos y privados en Colombia.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <button
              onClick={() => scrollTo("contacto")}
              className="inline-flex items-center gap-2 rounded-md bg-brand-orange px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 transition-all hover:brightness-110 hover:-translate-y-0.5"
            >
              Solicitar propuesta
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => scrollTo("servicios")}
              className="inline-flex items-center rounded-md border border-white/40 bg-white/5 backdrop-blur px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Conocer nuestros servicios
            </button>
          </div>
        </div>

        <button
          onClick={() => scrollTo("nosotros")}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 hover:text-white transition"
          aria-label="Desplazarse hacia abajo"
        >
          <span className="text-[10px] tracking-[0.25em] uppercase">Descubrir</span>
          <span className="relative flex h-8 w-5 justify-center rounded-full border border-white/50">
            <span className="mt-1 h-2 w-0.5 rounded bg-white animate-bounce" />
          </span>
        </button>
      </div>
    </section>
  );
}
