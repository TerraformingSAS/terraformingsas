import { Footer } from "@/components/Footer";
import { TERRA_NAV, TERRA_PROJECT } from "@/lib/terra/commercial";

export function TerraFooter() {
  return (
    <div>
      <div className="border-t border-white/10 bg-[#0a2038] text-white">
        <div className="container-tf flex flex-col gap-6 py-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-2xl font-bold tracking-[0.18em]">TERRA</p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
              Proyecto inmobiliario de {TERRA_PROJECT.company}. Etapa I de lotes residenciales en{" "}
              {TERRA_PROJECT.city}.
            </p>
          </div>
          <nav
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75"
            aria-label="Secciones de TERRA"
          >
            {TERRA_NAV.map((item) => (
              <a key={item.id} href={item.href} className="hover:text-brand-orange">
                {item.label}
              </a>
            ))}
            <a href={TERRA_PROJECT.explorerPath} className="hover:text-brand-orange">
              Plano de lotes
            </a>
          </nav>
        </div>
      </div>
      <Footer />
    </div>
  );
}
