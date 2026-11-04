/**
 * Eventos del embudo comercial que NO se generan al navegar el sitio.
 * Deben registrarse desde el CRM o el proceso comercial/jurídico.
 *
 * Contrato de datos sugerido (sin PII en analítica web):
 * - lead_id interno
 * - lote (código público, p. ej. C-12)
 * - first/last UTM
 * - fecha del hito
 */
export const TERRA_CRM_EVENTS = {
  qualify_lead: {
    name: "qualify_lead",
    description: "El equipo comercial confirma que el contacto cumple criterios de calificación.",
  },
  schedule_visit: {
    name: "schedule_visit",
    description: "Se confirma una visita agendada al proyecto.",
  },
  complete_visit: {
    name: "complete_visit",
    description: "Se registra una visita realizada.",
  },
  reservation_confirmed: {
    name: "reservation_confirmed",
    description: "Se confirma una reserva conforme al proceso comercial y jurídico.",
  },
} as const;
