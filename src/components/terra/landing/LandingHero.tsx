import aerialImg from "@/assets/terra/render-encabezado.webp";
import { trackTerraEvent } from "@/lib/terra/analytics";
import { TERRA_FINANCING, TERRA_PROJECT, formatCopMillions } from "@/lib/terra/commercial";
import { terraWhatsAppUrl } from "@/lib/terra/contact";
import { openPublicSimulator } from "@/components/terra/landing/links";

export function LandingHero() {
  return (
    <section
      id="proyecto"
      className="relative min-h-[100svh] scroll-mt-24 overflow-hidden bg-brand-navy text-white"
    >
      <img
        src={aerialImg}
        alt="Render aéreo ilustrativo de TERRA Etapa I en el km 1 vía Popayán–Santa Rosa"
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07182b]/92 via-[#0e2a47]/72 to-[#0e2a47]/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07182b]/80 via-transparent to-[#07182b]/30" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-[1240px] flex-col justify-end px-4 pb-16 pt-32 sm:px-6 sm:pb-20">
        <p className="motion-safe:animate-[terra-hero-rise_0.7s_ease_both] text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-orange">
          {TERRA_PROJECT.stage} · {TERRA_PROJECT.city}
        </p>
        <h1 className="motion-safe:animate-[terra-hero-rise_0.7s_ease_0.08s_both] mt-4 max-w-3xl font-display text-[2.6rem] font-bold leading-[0.98] sm:text-6xl lg:text-7xl">
          El lote donde empieza tu siguiente capítulo.
        </h1>
        <p className="motion-safe:animate-[terra-hero-rise_0.7s_ease_0.16s_both] mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
          {TERRA_PROJECT.hectares} hectáreas en {TERRA_PROJECT.locationLine}. Naturaleza, vías
          proyectadas y un recorrido claro para elegir, financiar y cotizar.
        </p>

        {TERRA_FINANCING.showPublicOffer ? (
          <dl className="motion-safe:animate-[terra-hero-rise_0.7s_ease_0.24s_both] mt-8 grid max-w-xl grid-cols-3 gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.16em] text-white/70">Separación</dt>
              <dd className="mt-1 font-display text-lg font-bold sm:text-2xl">
                {formatCopMillions(TERRA_FINANCING.separacionCop)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.16em] text-white/70">Financiable</dt>
              <dd className="mt-1 font-display text-lg font-bold sm:text-2xl">
                {TERRA_FINANCING.financedPercent}%
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.16em] text-white/70">
                A la entrega
              </dt>
              <dd className="mt-1 font-display text-lg font-bold sm:text-2xl">
                {TERRA_FINANCING.deliveryPercent}%
              </dd>
            </div>
          </dl>
        ) : null}

        <div className="motion-safe:animate-[terra-hero-rise_0.7s_ease_0.32s_both] mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => {
              trackTerraEvent("view_quote", { location: "hero_cuota" });
              openPublicSimulator();
            }}
            className="inline-flex min-h-14 items-center justify-center rounded-full bg-brand-orange px-7 text-base font-semibold text-white shadow-[0_12px_30px_rgba(247,148,29,0.35)] transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Calcula tu cuota
          </button>
          <a
            href="#contacto"
            onClick={() => trackTerraEvent("view_quote", { location: "hero_lote" })}
            className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/40 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            Cotiza tu lote
          </a>
          <a
            href={terraWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackTerraEvent("whatsapp_click", { location: "hero" })}
            className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#25D366] px-7 text-base font-semibold text-white transition hover:-translate-y-0.5"
          >
            Hablar por WhatsApp
          </a>
        </div>
        <p className="mt-4 max-w-lg text-[11px] leading-relaxed text-white/65">
          Renders ilustrativos. Condiciones sujetas a la vigencia comercial y a la disponibilidad
          del lote.
        </p>
      </div>
    </section>
  );
}
