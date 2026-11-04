import { TERRA_PROJECT } from "./commercial";

export function terraWhatsAppUrl(lotId?: string): string {
  const message = lotId
    ? `Hola, quiero recibir información y una cotización del lote ${lotId} de TERRA Etapa I`
    : `Hola TERRA, quiero más información sobre el proyecto. Información importante: ${TERRA_PROJECT.siteUrl}${TERRA_PROJECT.legalPath}`;
  return `https://wa.me/${TERRA_PROJECT.phoneE164}?text=${encodeURIComponent(message)}`;
}
