import { TASA_MENSUAL } from "@/features/terra-cotizador/lib/financiacion";

/** Cuota del simulador público. 12 meses sin interés; el resto usa la tasa mensual del proyecto. */
export function cuotaPublica(valorFinanciar: number, meses: number): number {
  if (valorFinanciar <= 0 || meses < 1) return 0;
  if (meses === 12) return Math.round(valorFinanciar / 12);
  const factor = Math.pow(1 + TASA_MENSUAL, meses);
  return Math.round((valorFinanciar * (TASA_MENSUAL * factor)) / (factor - 1));
}
