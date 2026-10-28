// Pantalla de acceso del Cotizador Terra: correo -> código de 6 dígitos.
// Usa los mismos componentes (shadcn/ui), colores y logos de la app actual.
// Ruta sugerida: src/pages/login.tsx  (y agregar { path: "/login", element: <LoginPage /> } en routes.tsx)
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { marcarActividad } from "@/features/terra-cotizador/lib/actividad";
import { ArrowLeft, Info, Loader2, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoColor from "@/assets/logo.png";
import { Link } from "@tanstack/react-router";
import logoLight from "@/features/terra-cotizador/assets/terraforming-logo-light.png";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REENVIO_SEG = 60;
const MENSAJES: Record<string, string> = {
  inactividad: "Tu sesión se cerró por 30 minutos sin uso. Ingresa de nuevo.",
  vencida: "Tu sesión terminó (duración máxima de 4 horas). Ingresa de nuevo.",
  desactivado:
    "Tu acceso al cotizador fue desactivado. Si crees que es un error, escribe a mercadeo@terraformings.co.",
  salio: "Cerraste sesión.",
};

export function LoginPage() {
  const qc = useQueryClient();
  const params = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
  const aviso = MENSAJES[params.get("motivo") ?? ""];
  const [paso, setPaso] = useState<"correo" | "codigo">("correo");
  const [email, setEmail] = useState("");
  const [digitos, setDigitos] = useState<string[]>(Array(6).fill(""));
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [espera, setEspera] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  async function pedirCodigo(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    if (!EMAIL_RE.test(email.trim())) return setError("Escribe un correo válido.");
    setCargando(true);
    try {
      await fetch("/api/auth/solicitar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setPaso("codigo");
      setDigitos(Array(6).fill(""));
      setEspera(REENVIO_SEG);
      setTimeout(() => refs.current[0]?.focus(), 50);
    } catch {
      setError("No pudimos enviar el código. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  async function verificar(codigo: string) {
    setCargando(true);
    setError("");
    try {
      const r = await fetch("/api/auth/verificar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), codigo }),
      });
      if (!r.ok) {
        setError("Código incorrecto o vencido.");
        setDigitos(Array(6).fill(""));
        refs.current[0]?.focus();
        return;
      }
      marcarActividad();
      qc.clear();
      window.location.assign("/terra/cotizador");
    } catch {
      setError("No pudimos verificar el código. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  function escribir(i: number, v: string) {
    const solo = v.replace(/\D/g, "");
    if (solo.length > 1) {
      // pegar el código completo
      const arr = solo.slice(0, 6).split("");
      const next = Array(6)
        .fill("")
        .map((_, k) => arr[k] ?? "");
      setDigitos(next);
      if (arr.length === 6) verificar(next.join(""));
      else refs.current[arr.length]?.focus();
      return;
    }
    const next = [...digitos];
    next[i] = solo;
    setDigitos(next);
    if (solo && i < 5) refs.current[i + 1]?.focus();
    if (next.every((d) => d)) verificar(next.join(""));
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* Panel de marca (solo escritorio) */}
      <aside className="relative hidden overflow-hidden bg-[#0e2a47] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-[0.07]"
          viewBox="0 0 400 400"
          preserveAspectRatio="xMidYMid slice"
        >
          {Array.from({ length: 12 }).map((_, r) =>
            Array.from({ length: 12 }).map((_, c) => (
              <rect
                key={`${r}-${c}`}
                x={c * 34 + 4}
                y={r * 34 + 4}
                width="30"
                height="30"
                rx="2"
                fill="none"
                stroke="#5f8d4e"
                strokeWidth="1"
              />
            )),
          )}
        </svg>
        <img src={logoLight} alt="Terra Forming" className="relative w-72" />
        <div className="relative max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f7941d]">
            Proyecto TERRA · Etapa I
          </p>
          <p className="mt-3 text-3xl font-semibold leading-tight">Cotizador de preventa</p>
          <p className="mt-3 text-sm text-white/75">
            Disponibilidad, precios y planes de financiación por lote, en tiempo real.
          </p>
        </div>
        <p className="relative text-xs text-white/60">
          TERRA FORMING S.A.S. · Cali, Valle del Cauca
        </p>
      </aside>

      {/* Formulario */}
      <main className="flex flex-col bg-background">
        <header className="border-b border-border bg-white/95 shadow-sm backdrop-blur lg:hidden">
          <div className="container-tf flex h-18 items-center py-3">
            <Link to="/" aria-label="TERRA FORMING inicio">
              <img src={logoColor} alt="TERRA FORMING" className="h-11 w-auto" width={300} height={83} />
            </Link>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 py-10">
          <div className="w-full max-w-sm">
            {aviso && paso === "correo" && (
              <p
                role="status"
                className="mb-6 flex items-start gap-2 rounded-lg border border-border bg-muted px-3 py-2.5 text-sm"
              >
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {aviso}
              </p>
            )}
            {paso === "correo" ? (
              <form onSubmit={pedirCodigo} noValidate className="flex flex-col gap-5">
                <div>
                  <span className="grid size-11 place-items-center rounded-full bg-[#f4f6f7] text-[#0e2a47] dark:bg-secondary dark:text-foreground">
                    <Mail className="size-5" aria-hidden="true" />
                  </span>
                  <h1 className="mt-4 text-2xl font-semibold">Ingresa al cotizador</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Te enviaremos un código de acceso a tu correo.
                  </p>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!error}
                    aria-describedby="login-error"
                    className="h-12 text-base"
                    placeholder="nombre@empresa.com"
                  />
                </div>
                {error && (
                  <p id="login-error" role="alert" className="text-sm font-medium text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" size="lg" className="h-12 text-base" disabled={cargando}>
                  {cargando ? <Loader2 className="animate-spin" /> : null} Enviar código
                </Button>
              </form>
            ) : (
              <div className="flex flex-col gap-5">
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setPaso("correo");
                      setError("");
                    }}
                    className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" /> Cambiar correo
                  </button>
                  <span className="mt-4 grid size-11 place-items-center rounded-full bg-[#f4f6f7] text-[#0e2a47] dark:bg-secondary dark:text-foreground">
                    <ShieldCheck className="size-5" aria-hidden="true" />
                  </span>
                  <h1 className="mt-4 text-2xl font-semibold">Revisa tu correo</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Si <span className="font-medium text-foreground">{email.trim()}</span> está
                    autorizado, recibirás un código de 6 dígitos. Vence en 10 minutos.
                  </p>
                </div>
                <fieldset>
                  <legend className="mb-2 text-sm font-medium">Código de acceso</legend>
                  <div className="flex justify-between gap-2">
                    {digitos.map((d, i) => (
                      <Input
                        key={i}
                        ref={(el) => {
                          refs.current[i] = el;
                        }}
                        value={d}
                        onChange={(e) => escribir(i, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus();
                        }}
                        inputMode="numeric"
                        autoComplete={i === 0 ? "one-time-code" : "off"}
                        maxLength={i === 0 ? 6 : 1}
                        aria-label={`Dígito ${i + 1} de 6`}
                        disabled={cargando}
                        className="h-14 w-full text-center text-2xl font-semibold tabular-nums"
                      />
                    ))}
                  </div>
                </fieldset>
                {error && (
                  <p role="alert" className="text-sm font-medium text-destructive">
                    {error}
                  </p>
                )}
                <Button
                  size="lg"
                  className="h-12 text-base"
                  disabled={cargando || digitos.some((x) => !x)}
                  onClick={() => verificar(digitos.join(""))}
                >
                  {cargando ? <Loader2 className="animate-spin" /> : null} Ingresar
                </Button>
                <p className="text-center text-sm">
                  {espera > 0 ? (
                    <span className="text-muted-foreground">
                      Puedes pedir otro código en {espera} s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => pedirCodigo()}
                      className="font-medium text-primary hover:underline"
                    >
                      Reenviar código
                    </button>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="px-5 pb-6 text-center text-xs text-muted-foreground">
          ¿No tienes acceso? Escribe a mercadeo@terraformings.co
        </footer>
      </main>
    </div>
  );
}
