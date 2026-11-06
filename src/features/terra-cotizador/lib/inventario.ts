import type { Estado, Lote } from "@/features/terra-cotizador/lib/lotes";

/** Orden y color del reporte comercial (dona y barras). */
export const ESTADOS_REPORTE: { key: Estado; label: string; color: string }[] = [
  { key: "disponible", label: "Disponible", color: "#1c9a68" },
  { key: "negociacion", label: "En negociación", color: "#e0a322" },
  { key: "no_disponible", label: "No disponible", color: "#9aa19c" },
  { key: "reservado", label: "Reservado", color: "#3d6fd8" },
  { key: "vendido", label: "Vendido", color: "#d15a52" },
];

export type FiltroInventario = {
  manzana: string;
  estado: "" | Estado;
  q: string;
};

export const FILTRO_INVENTARIO_VACIO: FiltroInventario = { manzana: "", estado: "", q: "" };

export function filtrarLotes(lotes: Lote[], filtro: FiltroInventario): Lote[] {
  const q = filtro.q.trim().toLowerCase();
  return lotes.filter((l) => {
    if (filtro.manzana && l.manzana !== filtro.manzana) return false;
    if (filtro.estado && l.estado !== filtro.estado) return false;
    if (!q) return true;
    const blob = `${l.id} ${l.idLote} ${l.manzana} ${l.lote} ${l.etapa}`.toLowerCase();
    return blob.includes(q);
  });
}

export function contarEstados(lotes: Lote[]): Record<Estado, number> {
  const c: Record<Estado, number> = {
    disponible: 0,
    reservado: 0,
    negociacion: 0,
    vendido: 0,
    no_disponible: 0,
  };
  for (const l of lotes) c[l.estado] += 1;
  return c;
}

export function areaRegistrada(lotes: Lote[]): number {
  return lotes.reduce((acc, l) => acc + (Number.isFinite(l.area) ? l.area : 0), 0);
}

export type FilaManzana = { manzana: string } & Record<Estado, number>;

export function inventarioPorManzana(lotes: Lote[]): FilaManzana[] {
  const map = new Map<string, FilaManzana>();
  for (const l of lotes) {
    const key = l.manzana || "—";
    let fila = map.get(key);
    if (!fila) {
      fila = {
        manzana: key,
        disponible: 0,
        reservado: 0,
        negociacion: 0,
        vendido: 0,
        no_disponible: 0,
      };
      map.set(key, fila);
    }
    fila[l.estado] += 1;
  }
  return [...map.values()].sort((a, b) => a.manzana.localeCompare(b.manzana, "es"));
}

function sumaCampo(lotes: Lote[], campo: "area" | "valorPreventa"): Record<Estado, number> {
  const c: Record<Estado, number> = {
    disponible: 0,
    reservado: 0,
    negociacion: 0,
    vendido: 0,
    no_disponible: 0,
  };
  for (const l of lotes) {
    const n = l[campo];
    if (Number.isFinite(n)) c[l.estado] += n;
  }
  return c;
}

export function valorPreventaPorEstado(lotes: Lote[]): Record<Estado, number> {
  return sumaCampo(lotes, "valorPreventa");
}

export function areaPorManzana(lotes: Lote[]): FilaManzana[] {
  const map = new Map<string, FilaManzana>();
  for (const l of lotes) {
    const key = l.manzana || "—";
    let fila = map.get(key);
    if (!fila) {
      fila = {
        manzana: key,
        disponible: 0,
        reservado: 0,
        negociacion: 0,
        vendido: 0,
        no_disponible: 0,
      };
      map.set(key, fila);
    }
    if (Number.isFinite(l.area)) fila[l.estado] += l.area;
  }
  return [...map.values()].sort((a, b) => a.manzana.localeCompare(b.manzana, "es"));
}

/** Pasos del cierre. «No disponible» no es etapa comercial. */
export const PASOS_EMBUDO: Estado[] = ["disponible", "reservado", "negociacion", "vendido"];

export function avanceComercial(lotes: Lote[]): {
  pasos: Record<Estado, number>;
  noDisponible: number;
} {
  const conteo = contarEstados(lotes);
  return { pasos: conteo, noDisponible: conteo.no_disponible };
}

export function manzanasDe(lotes: Lote[]): string[] {
  return [...new Set(lotes.map((l) => l.manzana).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );
}
