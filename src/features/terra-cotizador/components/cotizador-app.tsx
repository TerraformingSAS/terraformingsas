import { HomePage } from "@/features/terra-cotizador/pages/home";
import { CotizadorGate } from "@/features/terra-cotizador/components/cotizador-shell";

export function CotizadorApp() {
  return (
    <CotizadorGate>
      <HomePage />
    </CotizadorGate>
  );
}
