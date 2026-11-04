import aerialImg from "@/assets/terra/render-aereo.webp";

export function TerraFeaturedHero() {
  return (
    <section className="terra-featured relative min-h-[100svh] w-full overflow-hidden text-white">
      <img
        src={aerialImg}
        alt="Render aéreo ilustrativo de TERRA Etapa I en Popayán, con lotes residenciales y entorno natural"
        className="absolute inset-0 h-full w-full object-cover object-[68%_42%] sm:object-[58%_center]"
        width={1729}
        height={910}
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0e2a47]/80 via-[#0e2a47]/35 to-[#0e2a47]/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0e2a47]/55 via-transparent to-[#0e2a47]/25" />

      <div className="terra-featured__content relative container-tf flex min-h-[100svh] flex-col justify-end pb-16 pt-28 sm:justify-center sm:pb-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f7941d]">
          Proyecto destacado · TERRA Etapa I
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-[2.15rem] font-bold uppercase leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          Un lugar para construir tu historia
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
          Descubre TERRA, un proyecto de 20 hectáreas con lotes residenciales y un entorno natural
          en Popayán, km 1 vía a Santa Rosa.
        </p>
        <ul className="mt-6 flex flex-col gap-2 text-sm font-medium sm:flex-row sm:flex-wrap sm:gap-x-6">
          <li>20 hectáreas de proyecto</li>
          <li>Lotes residenciales</li>
          <li>Popayán · Km 1 vía a Santa Rosa</li>
        </ul>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="/terra"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#f7941d] px-6 text-sm font-semibold tracking-wide text-white"
          >
            Conoce TERRA
          </a>
          <a
            href="/terra/estado"
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/70 px-6 text-sm font-semibold tracking-wide text-white"
          >
            Explora los lotes
          </a>
        </div>
      </div>

      <a
        href="#inicio"
        className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-[11px] font-medium tracking-[0.16em] text-white/80 uppercase"
      >
        Descubre Terraforming
        <span aria-hidden className="text-base leading-none">
          ↓
        </span>
      </a>
      <style>{`
        .terra-featured__content {
          animation: terra-featured-in 0.8s ease-out both;
        }
        @keyframes terra-featured-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .terra-featured__content { animation: none; }
        }
      `}</style>
    </section>
  );
}
