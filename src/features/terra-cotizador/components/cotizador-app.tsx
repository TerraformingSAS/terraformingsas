import { useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2, LogOut, Moon, RotateCw, Sun } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import emblem from "@/features/terra-cotizador/assets/tf-emblem-light.png";
import { HomePage } from "@/features/terra-cotizador/pages/home";
import { useLotes } from "@/features/terra-cotizador/lib/datos";
import { fmtFechaHora } from "@/features/terra-cotizador/lib/lotes";
import {
  NoAutorizado,
  irAlLogin,
  useCerrarSesion,
  useSesion,
} from "@/features/terra-cotizador/lib/auth";
import {
  AVISO_MS,
  INACTIVIDAD_MS,
  escucharActividad,
  marcarActividad,
  ultimaActividad,
} from "@/features/terra-cotizador/lib/actividad";

const THEME_KEY = "terra-cotizador-tema";

function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const toggle = () =>
    setDark((current) => {
      localStorage.setItem(THEME_KEY, current ? "light" : "dark");
      return !current;
    });
  return { dark, toggle };
}

export function CotizadorApp() {
  const session = useSesion();
  const salir = useCerrarSesion();
  const avisado = useRef(false);

  useEffect(() => {
    if (session.isError && session.error instanceof NoAutorizado) {
      irAlLogin(session.error.motivo);
    }
  }, [session.error, session.isError]);

  useEffect(() => {
    escucharActividad();
    marcarActividad();
    const timer = window.setInterval(() => {
      const inactivo = Date.now() - ultimaActividad();
      if (inactivo >= INACTIVIDAD_MS) {
        window.clearInterval(timer);
        void salir("inactividad");
      } else if (inactivo >= INACTIVIDAD_MS - AVISO_MS) {
        if (!avisado.current) {
          avisado.current = true;
          toast.warning("Tu sesión se cerrará en 2 minutos por inactividad.", {
            id: "inactividad",
            duration: AVISO_MS,
            action: { label: "Seguir aquí", onClick: marcarActividad },
          });
        }
      } else if (avisado.current) {
        avisado.current = false;
        toast.dismiss("inactividad");
      }
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [salir]);

  if (session.isPending || (session.isError && session.error instanceof NoAutorizado)) {
    return (
      <div className="terra-cotizador-app grid min-h-dvh place-items-center bg-background text-foreground">
        <Loader2 className="size-6 animate-spin" aria-hidden="true" />
        <span className="sr-only">Validando acceso</span>
      </div>
    );
  }

  if (session.isError) {
    return (
      <div className="terra-cotizador-app grid min-h-dvh place-items-center bg-background px-5 text-foreground">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold">No pudimos validar tu acceso</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Revisa tu conexión e intenta de nuevo.
          </p>
          <Button className="mt-5" onClick={() => session.refetch()}>
            <RotateCw aria-hidden="true" /> Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <CotizadorShell>
      <HomePage />
    </CotizadorShell>
  );
}

function CotizadorShell({ children }: { children: ReactNode }) {
  const { dark, toggle } = useTheme();
  const sesion = useSesion();
  const salir = useCerrarSesion();

  return (
    <div
      className={`terra-cotizador-app ${dark ? "dark" : "light"} flex min-h-screen flex-col bg-muted/40 text-foreground`}
    >
      <a
        href="#trabajo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Saltar al cotizador
      </a>
      <header className="sticky top-0 z-30 border-b-2 border-[#f7941d] bg-[#0e2a47] text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2.5 px-3 sm:gap-3 sm:px-4">
          <img src={emblem} alt="" aria-hidden="true" className="h-7 w-auto shrink-0 sm:h-8" />
          <div className="flex min-w-0 flex-col leading-tight">
            <span
              className="truncate text-sm font-bold tracking-[0.18em] sm:text-base sm:tracking-[0.28em]"
              aria-label="Terra Forming"
            >
              <span className="text-white">TERRA</span>{" "}
              <span className="text-[#8fbf7a]">FORMING</span>
            </span>
            <span className="flex items-center gap-1.5 truncate text-[10px] uppercase tracking-[0.1em] text-white/75 sm:text-[11px] sm:tracking-[0.16em]">
              Cotizador preventa
              <span
                className="hidden size-1 shrink-0 rounded-full bg-[#f7941d] min-[400px]:inline-block"
                aria-hidden="true"
              />
              <span className="hidden min-[400px]:inline">Etapa I</span>
            </span>
          </div>
          <span className="ml-auto hidden max-w-48 truncate text-xs text-white/80 md:inline">
            {sesion.data?.nombre}
          </span>
          <button
            type="button"
            onClick={toggle}
            aria-pressed={dark}
            aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            className="ml-auto grid size-10 shrink-0 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:ml-0"
          >
            {dark ? (
              <Sun className="size-5" aria-hidden="true" />
            ) : (
              <Moon className="size-5" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => void salir()}
            aria-label="Cerrar sesión"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <LogOut className="size-5" aria-hidden="true" />
          </button>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <FuenteFooter />
      <Toaster />
    </div>
  );
}

function FuenteFooter() {
  const query = useLotes();
  return (
    <footer className="border-t border-border bg-background px-4 pb-32 pt-3 text-center text-xs lg:pb-3">
      <span className="font-medium">Precios actualizados:</span>{" "}
      {query.isPending ? (
        "consultando…"
      ) : query.isError ? (
        <span>no disponible en este momento</span>
      ) : (
        <time dateTime={query.data.actualizado.toISOString()}>
          {fmtFechaHora(query.data.actualizado)}
        </time>
      )}
    </footer>
  );
}
