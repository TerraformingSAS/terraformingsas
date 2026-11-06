import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { HomePage } from "@/features/terra-cotizador/pages/home";
import { CotizadorGate } from "@/features/terra-cotizador/components/cotizador-shell";
import { useSesion } from "@/features/terra-cotizador/lib/auth";
import { esAdminRol } from "@/features/terra-cotizador/lib/parametros";

/** Se limpia al entrar al login para que cada ingreso de admin abra Estadísticas. */
export const ADMIN_INICIO_KEY = "terra-cotizador-admin-inicio";

export function CotizadorApp() {
  return (
    <CotizadorGate>
      <AdminVistaInicial />
      <HomePage />
    </CotizadorGate>
  );
}

function AdminVistaInicial() {
  const sesion = useSesion();
  const navigate = useNavigate();

  useEffect(() => {
    if (!esAdminRol(sesion.data?.rol)) return;
    const params = new URLSearchParams(window.location.search);
    if (params.has("lote") || params.get("vista") === "cotizador") return;
    if (sessionStorage.getItem(ADMIN_INICIO_KEY) === "1") return;
    sessionStorage.setItem(ADMIN_INICIO_KEY, "1");
    void navigate({ to: "/terra/cotizador/estadisticas", replace: true });
  }, [navigate, sesion.data?.rol]);

  return null;
}
