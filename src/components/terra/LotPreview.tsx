import { TerraPrimaryLink } from "@/components/terra/primitives";
import {
  TERRA_FINANCING,
  TERRA_LOT_TYPES,
  TERRA_PROJECT,
  formatCopMillions,
} from "@/lib/terra/commercial";

export function LotPreview() {
  return (
    <section id="lotes" className="scroll-mt-24 bg-brand-cream py-14 sm:py-20">
      <div className="container-tf">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-orange">
              Etapa I
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-brand-navy">Tipos de lote</h2>
          </div>
          <TerraPrimaryLink href={TERRA_PROJECT.explorerPath}>Ver plano</TerraPrimaryLink>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {TERRA_LOT_TYPES.map((type) => (
            <li key={type.area} className="bg-white px-4 py-5">
              <p className="font-display text-2xl font-bold text-brand-navy">{type.label}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-brand-dark/60">Área</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-brand-navy">
          Separación {formatCopMillions(TERRA_FINANCING.separacionCop)} ·{" "}
          {TERRA_FINANCING.financedPercent}% financiable · {TERRA_FINANCING.deliveryPercent}% a la
          entrega. El precio de cada lote se confirma en la cotización.
        </p>
      </div>
    </section>
  );
}
