import { TerraLeadForm } from "@/components/terra/TerraLeadForm";
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
        <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-2">
          <ul className="flex flex-col gap-3 lg:h-full">
            {TERRA_LOT_TYPES.map((type) => (
              <li
                key={type.area}
                className="flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm lg:flex-1"
              >
                <p className="text-sm font-medium text-brand-dark/70">Lotes de {type.label}</p>
                <div className="text-right">
                  <p className="font-display text-2xl font-bold leading-none text-brand-orange sm:text-3xl">
                    {formatCop(type.fromCop)}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-navy">
                    Desde
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div id="contacto" className="scroll-mt-28 lg:sticky lg:top-24">
            <TerraLeadForm compact />
          </div>
        </div>
      </div>
    </section>
  );
}
