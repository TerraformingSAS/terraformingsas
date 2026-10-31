/** Parámetros del cotizador: defaults en código + override desde Upstash Redis. */

export type TarifaFila = { area: number; valorM2: number; preventa: number };

export type ParametroItem = {
  id?: string;
  clave: string;
  valor: string;
  tipo: "numero" | "texto" | "json";
  grupo: "calculo" | "tarifa" | "mensajes" | "pagos" | "contacto";
  descripcion: string;
};

export type ParametrosCotizador = {
  separacionCop: number;
  tasaMensual: number;
  planesMeses: number[];
  porcentajes: number[];
  vigenciaDias: number;
  tarifaPreventa: TarifaFila[];
  msgCuotaExtra: string;
  msgCuotasValorizacion: string;
  msgNoReserva: string;
  empresaNombre: string;
  nit: string;
  banco: string;
  cuenta: string;
  emailMercadeo: string;
  telefono: string;
  direccion: string;
};

export const TARIFA_PREVENTA_DEFAULT: TarifaFila[] = [
  { area: 120, valorM2: 617_500, preventa: 74_100_000 },
  { area: 154, valorM2: 604_500, preventa: 93_093_000 },
  { area: 165, valorM2: 601_900, preventa: 99_313_500 },
  { area: 211.75, valorM2: 598_000, preventa: 126_626_500 },
  { area: 442.75, valorM2: 585_000, preventa: 259_008_750 },
];

export const PARAMETROS_DEFAULT: ParametrosCotizador = {
  separacionCop: 5_000_000,
  tasaMensual: 0.01,
  planesMeses: [12, 24, 36],
  porcentajes: [70, 100],
  vigenciaDias: 5,
  tarifaPreventa: TARIFA_PREVENTA_DEFAULT,
  msgCuotaExtra: "La cuota incluye valorización e IPC",
  msgCuotasValorizacion:
    "En las cuotas a 24 y 36 meses, la cuota incluye valorización e IPC.",
  msgNoReserva:
    "Esta cotización no implica reserva del lote ni perfecciona por sí sola su compraventa.",
  empresaNombre: "TERRA FORMING SAS",
  nit: "9018681500",
  banco: "Banco de Bogotá",
  cuenta: "Cuenta corriente No. 256708884",
  emailMercadeo: "mercadeo@terraformings.co",
  telefono: "321 423 0090",
  direccion: "Calle 10 # 4-40, Of. 1001, Edificio Bolsa de Occidente · Cali",
};

/** Definición canónica de ítems (semilla / UI admin → Redis). */
export const PARAMETROS_SEED: ParametroItem[] = [
  {
    clave: "separacion_cop",
    valor: String(PARAMETROS_DEFAULT.separacionCop),
    tipo: "numero",
    grupo: "calculo",
    descripcion: "Valor de separación en COP",
  },
  {
    clave: "tasa_mensual",
    valor: String(PARAMETROS_DEFAULT.tasaMensual),
    tipo: "numero",
    grupo: "calculo",
    descripcion: "Factor mensual usado en cuotas 24 y 36 (p. ej. 0.01)",
  },
  {
    clave: "planes_meses",
    valor: JSON.stringify(PARAMETROS_DEFAULT.planesMeses),
    tipo: "json",
    grupo: "calculo",
    descripcion: "Plazos de financiación disponibles",
  },
  {
    clave: "porcentajes",
    valor: JSON.stringify(PARAMETROS_DEFAULT.porcentajes),
    tipo: "json",
    grupo: "calculo",
    descripcion: "Porcentajes de financiación disponibles",
  },
  {
    clave: "vigencia_dias",
    valor: String(PARAMETROS_DEFAULT.vigenciaDias),
    tipo: "numero",
    grupo: "calculo",
    descripcion: "Vigencia de la cotización en días calendario",
  },
  {
    clave: "tarifa_preventa",
    valor: JSON.stringify(PARAMETROS_DEFAULT.tarifaPreventa),
    tipo: "json",
    grupo: "tarifa",
    descripcion: "Tabla oficial de preventa por área (area, valorM2, preventa)",
  },
  {
    clave: "msg_cuota_extra",
    valor: PARAMETROS_DEFAULT.msgCuotaExtra,
    tipo: "texto",
    grupo: "mensajes",
    descripcion: "Texto bajo cuotas 24/36 en el PDF",
  },
  {
    clave: "msg_cuotas_valorizacion",
    valor: PARAMETROS_DEFAULT.msgCuotasValorizacion,
    tipo: "texto",
    grupo: "mensajes",
    descripcion: "Disclaimer de cuotas 24/36 en condiciones",
  },
  {
    clave: "msg_no_reserva",
    valor: PARAMETROS_DEFAULT.msgNoReserva,
    tipo: "texto",
    grupo: "mensajes",
    descripcion: "Disclaimer de que la cotización no reserva el lote",
  },
  {
    clave: "empresa_nombre",
    valor: PARAMETROS_DEFAULT.empresaNombre,
    tipo: "texto",
    grupo: "pagos",
    descripcion: "Razón social en pagos",
  },
  {
    clave: "nit",
    valor: PARAMETROS_DEFAULT.nit,
    tipo: "texto",
    grupo: "pagos",
    descripcion: "NIT",
  },
  {
    clave: "banco",
    valor: PARAMETROS_DEFAULT.banco,
    tipo: "texto",
    grupo: "pagos",
    descripcion: "Banco",
  },
  {
    clave: "cuenta",
    valor: PARAMETROS_DEFAULT.cuenta,
    tipo: "texto",
    grupo: "pagos",
    descripcion: "Número / tipo de cuenta",
  },
  {
    clave: "email_mercadeo",
    valor: PARAMETROS_DEFAULT.emailMercadeo,
    tipo: "texto",
    grupo: "contacto",
    descripcion: "Correo de mercadeo / destino de avisos",
  },
  {
    clave: "telefono",
    valor: PARAMETROS_DEFAULT.telefono,
    tipo: "texto",
    grupo: "contacto",
    descripcion: "Teléfono de contacto",
  },
  {
    clave: "direccion",
    valor: PARAMETROS_DEFAULT.direccion,
    tipo: "texto",
    grupo: "contacto",
    descripcion: "Dirección en el pie del PDF",
  },
];

export function esAdminRol(rol: string | undefined | null): boolean {
  return String(rol ?? "")
    .trim()
    .toLowerCase() === "administrador";
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function num(raw: string | undefined, fallback: number): number {
  if (raw == null || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/** Une ítems clave/valor (Redis o seed) en el objeto tipado de runtime. */
export function parametrosDesdeItems(
  items: Pick<ParametroItem, "clave" | "valor">[],
  base: ParametrosCotizador = PARAMETROS_DEFAULT,
): ParametrosCotizador {
  const map = new Map(items.map((i) => [i.clave, i.valor]));
  const get = (k: string) => map.get(k);
  const tarifa = parseJson<TarifaFila[]>(get("tarifa_preventa") ?? "", base.tarifaPreventa);
  return {
    separacionCop: num(get("separacion_cop"), base.separacionCop),
    tasaMensual: num(get("tasa_mensual"), base.tasaMensual),
    planesMeses: parseJson<number[]>(get("planes_meses") ?? "", base.planesMeses),
    porcentajes: parseJson<number[]>(get("porcentajes") ?? "", base.porcentajes),
    vigenciaDias: Math.max(1, Math.round(num(get("vigencia_dias"), base.vigenciaDias))),
    tarifaPreventa: Array.isArray(tarifa) && tarifa.length > 0 ? tarifa : base.tarifaPreventa,
    msgCuotaExtra: get("msg_cuota_extra")?.trim() || base.msgCuotaExtra,
    msgCuotasValorizacion: get("msg_cuotas_valorizacion")?.trim() || base.msgCuotasValorizacion,
    msgNoReserva: get("msg_no_reserva")?.trim() || base.msgNoReserva,
    empresaNombre: get("empresa_nombre")?.trim() || base.empresaNombre,
    nit: get("nit")?.trim() || base.nit,
    banco: get("banco")?.trim() || base.banco,
    cuenta: get("cuenta")?.trim() || base.cuenta,
    emailMercadeo: get("email_mercadeo")?.trim() || base.emailMercadeo,
    telefono: get("telefono")?.trim() || base.telefono,
    direccion: get("direccion")?.trim() || base.direccion,
  };
}

/** Convierte el objeto tipado a ítems editables (sin id). */
export function itemsDesdeParametros(p: ParametrosCotizador): ParametroItem[] {
  const valores: Record<string, string> = {
    separacion_cop: String(p.separacionCop),
    tasa_mensual: String(p.tasaMensual),
    planes_meses: JSON.stringify(p.planesMeses),
    porcentajes: JSON.stringify(p.porcentajes),
    vigencia_dias: String(p.vigenciaDias),
    tarifa_preventa: JSON.stringify(p.tarifaPreventa),
    msg_cuota_extra: p.msgCuotaExtra,
    msg_cuotas_valorizacion: p.msgCuotasValorizacion,
    msg_no_reserva: p.msgNoReserva,
    empresa_nombre: p.empresaNombre,
    nit: p.nit,
    banco: p.banco,
    cuenta: p.cuenta,
    email_mercadeo: p.emailMercadeo,
    telefono: p.telefono,
    direccion: p.direccion,
  };
  return PARAMETROS_SEED.map((s) => ({
    ...s,
    valor: valores[s.clave] ?? s.valor,
  }));
}
