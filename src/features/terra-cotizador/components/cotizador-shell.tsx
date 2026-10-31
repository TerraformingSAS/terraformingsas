import { useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2, LogOut, Moon, RotateCw, Sun } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import logoColor from "@/assets/logo.png";
import { Link, useRouterState } from "@tanstack/react-router";
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
import { esAdminRol } from "@/features/terra-cotizador/lib/parametros";
import { cn } from "@/lib/utils";

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

/** Valida sesión e inactividad; renderiza el shell del cotizador. */
export function CotizadorGate({
  children,
  requireAdmin = false,
}: {
  children: ReactNode;
  requireAdmin?: boolean;
}) {
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

  if (requireAdmin && !esAdminRol(session.data?.rol)) {
    return (
      <CotizadorShell>
        <div className="container-tf flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
          <h1 className="text-xl font-semibold text-[#0e2a47]">Acceso restringido</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Esta pantalla es solo para administradores.
          </p>
          <Button asChild>
            <Link to="/terra/cotizador">Volver al cotizador</Link>
          </Button>
        </div>
      </CotizadorShell>
    );
  }

  return <CotizadorShell>{children}</CotizadorShell>;
}

export function CotizadorShell({ children }: { children: ReactNode }) {
  const { dark, toggle } = useTheme();
  const sesion = useSesion();
  const salir = useCerrarSesion();
  const admin = esAdminRol(sesion.data?.rol);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
      <header className="sticky top-0 z-30 border-b border-border bg-white/95 shadow-sm backdrop-blur">
        <div className="container-tf flex h-18 items-center justify-between gap-3 py-3">
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="TERRA FORMING inicio">
            <img src={logoColor} alt="TERRA FORMING" className="h-11 w-auto" width={300} height={83} />
          </Link>
          {admin ? (
            <nav
              aria-label="Administración cotizador"
              className="hidden min-w-0 items-center gap-1 sm:flex"
            >
              <AdminNavLink to="/terra/cotizador" active={pathname === "/terra/cotizador"}>
                Cotizador
              </AdminNavLink>
              <AdminNavLink
                to="/terra/cotizador/parametros"
                active={pathname.startsWith("/terra/cotizador/parametros")}
              >
                Parámetros
              </AdminNavLink>
              <AdminNavLink
                to="/terra/cotizador/estadisticas"
                active={pathname.startsWith("/terra/cotizador/estadisticas")}
              >
                Estadísticas
              </AdminNavLink>
            </nav>
          ) : (
            <p className="hidden min-w-0 truncate text-sm font-medium tracking-wide text-brand-navy sm:block">
              Cotizador preventa
            </p>
          )}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <span className="hidden max-w-40 truncate text-sm font-medium text-brand-navy md:inline">
              {sesion.data?.nombre}
            </span>
            {admin && (
              <span className="hidden rounded bg-[#0e2a47] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white sm:inline">
                Admin
              </span>
            )}
            {admin && (
              <div className="flex items-center gap-0.5 sm:hidden">
                <AdminNavLink to="/terra/cotizador" active={pathname === "/terra/cotizador"} compact>
                  Cotiz.
                </AdminNavLink>
                <AdminNavLink
                  to="/terra/cotizador/parametros"
                  active={pathname.startsWith("/terra/cotizador/parametros")}
                  compact
                >
                  Params
                </AdminNavLink>
                <AdminNavLink
                  to="/terra/cotizador/estadisticas"
                  active={pathname.startsWith("/terra/cotizador/estadisticas")}
                  compact
                >
                  Stats
                </AdminNavLink>
              </div>
            )}
            <button
              type="button"
              onClick={toggle}
              aria-pressed={dark}
              aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="grid size-10 shrink-0 place-items-center rounded-md text-brand-navy transition-colors hover:text-brand-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
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
              className="grid size-10 shrink-0 place-items-center rounded-md text-brand-navy transition-colors hover:text-brand-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
            >
              <LogOut className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <div className="pb-36 lg:pb-0">
        <FuenteFooter />
        <Footer />
      </div>
      <Toaster />
    </div>
  );
}

function AdminNavLink({
  to,
  active,
  children,
  compact = false,
}: {
  to: "/terra/cotizador" | "/terra/cotizador/parametros" | "/terra/cotizador/estadisticas";
  active: boolean;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy",
        compact ? "px-2 py-1.5 text-xs" : "px-3 py-1.5 text-sm",
        active
          ? "bg-[#0e2a47] text-white"
          : "text-brand-navy hover:bg-muted hover:text-brand-orange",
      )}
    >
      {children}
    </Link>
  );
}

function FuenteFooter() {
  const query = useLotes();
  return (
    <p className="border-t border-border bg-white px-4 py-3 text-center text-xs text-brand-navy/70">
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
    </p>
  );
}
