import { TerraPrimaryLink } from "@/components/terra/primitives";
import { TERRA_LOT_TYPES, TERRA_PROJECT, formatCop } from "@/lib/terra/commercial";

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
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TERRA_LOT_TYPES.map((type) => (
            <li key={type.area} className="rounded-2xl bg-white px-5 py-6 shadow-sm">
              <p className="text-sm font-medium text-brand-dark/70">Lotes de {type.label}</p>
              <p className="mt-3 font-display text-3xl font-bold leading-none text-brand-orange">
                {formatCop(type.fromCop)}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-navy">
                Desde
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
