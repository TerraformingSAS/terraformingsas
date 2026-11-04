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
        <ul className="mt-8 divide-y divide-brand-navy/10 border-y border-brand-navy/10">
          {TERRA_LOT_TYPES.map((type) => (
            <li key={type.area} className="flex items-baseline justify-between gap-4 py-4">
              <p className="text-sm text-brand-navy sm:text-base">Lotes de {type.label}</p>
              <p className="text-right text-sm font-semibold text-brand-navy sm:text-base">
                {type.fromCop != null ? (
                  <>
                    Desde {formatCop(type.fromCop)}
                    <sup aria-hidden>*</sup>
                  </>
                ) : (
                  "Precio en cotización"
                )}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-brand-dark/70">
          <sup>*</sup> Precios de preventa según la tabla de precios. El valor definitivo se
          confirma en la cotización del lote.
        </p>
      </div>
    </section>
  );
}
