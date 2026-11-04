import {
  PLANES_MESES,
  PORCENTAJES,
  SEPARACION_COP,
} from "../../features/terra-cotizador/lib/financiacion.ts";

/** Condiciones y copy públicos de TERRA. Las cifras económicas salen del cotizador. */
export const TERRA_PROJECT = {
  name: "TERRA",
  stage: "Etapa I",
  product: "Lotes residenciales en Popayán",
  city: "Popayán",
  locationLine: "km 1 vía Popayán–Santa Rosa",
  hectares: 20,
  company: "TERRA FORMING S.A.S.",
  phoneDisplay: "321 423 0090",
  phoneE164: "573214230090",
  emailGerencia: "gerencia@terraformings.co",
  emailMercadeo: "mercadeo@terraformings.co",
  addressLines: [
    "Calle 10 # 4 - 40, Oficina 1001",
    "Edificio Bolsa de Occidente, San Pedro",
    "Cali, Valle del Cauca, Colombia",
  ],
  mapsEmbed:
    "https://www.google.com/maps/d/u/0/embed?mid=1W2I5RfshHNClX4RHmQsCxKhD0VJ12TY&ehbc=2E312F&noprof=1",
  mapsShare:
    "https://www.google.com/maps/d/u/0/edit?mid=1W2I5RfshHNClX4RHmQsCxKhD0VJ12TY&usp=sharing",
  mapsDirections: "https://www.google.com/maps/d/u/0/viewer?mid=1W2I5RfshHNClX4RHmQsCxKhD0VJ12TY",
  legalPath: "/terra/avisolegal",
  privacyPath: "/politica-de-privacidad",
  landingPath: "/terra",
  explorerPath: "/terra/estado",
  cotizadorPath: "/terra/cotizador",
  siteUrl: "https://www.terraformings.co",
} as const;

/**
 * Campañas con fecha de cierre. Si ya vencieron, no se publican como vigentes.
 * Referencia comercial: descuentos originales asociados al 31 oct 2026;
 * pago de cuota inicial previsto hasta el 15 nov 2026.
 */
export const TERRA_DATED_CAMPAIGNS = [
  {
    id: "descuentos-originales",
    label: "Descuentos originales de preventa",
    endsAt: "2026-10-31T23:59:59-05:00",
    publicMessage: "Descuentos originales vigentes hasta el 31 de octubre de 2026.",
  },
  {
    id: "cuota-inicial",
    label: "Pago de cuota inicial anunciado",
    endsAt: "2026-11-15T23:59:59-05:00",
    publicMessage: "Pago de cuota inicial previsto hasta el 15 de noviembre de 2026.",
  },
] as const;

export type TerraDatedCampaignId = (typeof TERRA_DATED_CAMPAIGNS)[number]["id"];

export function isDatedCampaignActive(id: TerraDatedCampaignId, now: Date = new Date()): boolean {
  const campaign = TERRA_DATED_CAMPAIGNS.find((item) => item.id === id);
  if (!campaign) return false;
  return now.getTime() <= Date.parse(campaign.endsAt);
}

export function activeDatedCampaigns(now: Date = new Date()) {
  return TERRA_DATED_CAMPAIGNS.filter((item) => isDatedCampaignActive(item.id, now));
}

/**
 * La separación de $5 millones y el 70/30 no son un descuento con fecha de
 * vencimiento: son los parámetros vigentes del cotizador.
 */
export const TERRA_FINANCING = {
  separacionCop: SEPARACION_COP,
  financedPercent: 70 as const,
  deliveryPercent: 30 as const,
  plansMonths: PLANES_MESES,
  percentages: PORCENTAJES,
  showPublicOffer: true,
};

export function formatCopMillions(value: number): string {
  if (value >= 1_000_000 && value % 1_000_000 === 0) {
    return `$${value / 1_000_000} millones`;
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export const TERRA_COPY = {
  heroEyebrow: "TERRA · ETAPA I",
  heroTitle: "Lotes residenciales en Popayán",
  heroLead: "Un lugar para construir tu historia",
  heroBody:
    "Descubre un proyecto de 20 hectáreas en el km 1 vía Popayán–Santa Rosa, donde la naturaleza y tus nuevos proyectos encuentran su espacio.",
  overviewTitle: "Conoce TERRA",
  lotsTitle: "Encuentra el lote para tus planes",
  timelineTitle: "Conoce cómo avanza TERRA",
  timelineDisclaimer:
    "Cronograma estimado, sujeto a permisos, aprobaciones y condiciones técnicas.",
  locationTitle: "TERRA, en Popayán",
  formTitle: "Solicita una cotización personalizada",
  closingLead: "Tu próximo proyecto comienza por elegir el lugar",
  explorerTitle: "Explora los lotes de TERRA",
  explorerSubtitle:
    "Consulta la ubicación, el área y la disponibilidad de los lotes de la Etapa I.",
  renderCaption: "Render ilustrativo",
  projectedCaption: "Espacio proyectado",
} as const;

export const TERRA_NAV = [
  { id: "proyecto", label: "Proyecto", href: "/terra#proyecto" },
  { id: "ubicacion", label: "Ubicación", href: "/terra#ubicacion" },
  { id: "financiacion", label: "Financiación", href: "/terra#financiacion" },
  { id: "naturaleza", label: "Naturaleza", href: "/terra#naturaleza" },
  { id: "lotes", label: "Lotes", href: "/terra#lotes" },
  { id: "desarrollo", label: "Desarrollo", href: "/terra#desarrollo" },
  { id: "contacto", label: "Contacto", href: "/terra#contacto" },
] as const;

/** Áreas reales del Excel de disponibilidad. El precio por lote no es público. */
export const TERRA_LOT_TYPES = [
  { area: 120, label: "120 m²" },
  { area: 154, label: "154 m²" },
  { area: 165, label: "165 m²" },
  { area: 211.75, label: "211,75 m²" },
  { area: 442.75, label: "442,75 m²" },
] as const;

export const TERRA_TIMELINE = [
  {
    id: "regulatoria",
    title: "Etapa regulatoria inicial",
    detail: "Aproximadamente 6 a 8 meses para estudios, radicación y gestiones ante autoridades.",
    durationLabel: "6–8 meses",
  },
  {
    id: "estudios",
    title: "Estudios y diseños",
    detail: "Avance de documentos técnicos y de diseño del proyecto.",
    durationLabel: null,
  },
  {
    id: "terreno",
    title: "Preparación del terreno",
    detail: "Obras preliminares sobre el predio, según el avance autorizado.",
    durationLabel: null,
  },
  {
    id: "redes",
    title: "Redes de servicios públicos",
    detail: "Infraestructura de servicios prevista para la urbanización.",
    durationLabel: null,
  },
  {
    id: "vias",
    title: "Vías y espacios comunes",
    detail: "Vías, zonas verdes y espacios compartidos contemplados en el proyecto.",
    durationLabel: null,
  },
  {
    id: "entrega",
    title: "Verificaciones, entrega y escrituración",
    detail: "Cierres técnicos y escrituración individual prevista, cuando corresponda.",
    durationLabel: null,
  },
] as const;

export const TERRA_TIMELINE_HORIZON_MONTHS = 36;
