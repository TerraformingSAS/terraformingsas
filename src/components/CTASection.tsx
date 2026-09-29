import ctaImg from "@/assets/cta.jpg";

export function CTASection() {
  return (
    <section className="relative py-28 overflow-hidden">
      <img
        src={ctaImg}
        alt="Infraestructura al atardecer"
        loading="lazy"
        width={1920}
        height={900}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/85 to-brand-navy/60" />
      <div className="relative container-tf text-white">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-brand-orange">
            <span className="h-px w-8 bg-brand-orange" />
            Trabajemos juntos
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            Construyamos su próximo proyecto
          </h2>
          <p className="mt-5 text-white/80 text-base sm:text-lg leading-relaxed">
            Nuestro equipo está listo para acompañarlo desde la planeación
            hasta la ejecución.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#contacto"
              className="inline-flex items-center gap-2 rounded-md bg-brand-orange px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 hover:-translate-y-0.5"
            >
              Solicitar información
            </a>
            <a
              href="https://wa.me/573214230090?text=Hola%20TERRA%20FORMING%2C%20quiero%20información%20sobre%20sus%20servicios."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-white/40 bg-white/5 backdrop-blur px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.52 3.48A11.94 11.94 0 0012.06 0C5.5 0 .17 5.33.17 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.65a11.9 11.9 0 005.76 1.47h.01c6.56 0 11.9-5.33 11.9-11.9 0-3.18-1.24-6.16-3.45-8.44zM12.07 21.7a9.8 9.8 0 01-5-1.37l-.36-.21-3.74.98 1-3.64-.24-.37a9.8 9.8 0 01-1.5-5.19c0-5.42 4.42-9.83 9.85-9.83 2.63 0 5.1 1.02 6.96 2.88a9.77 9.77 0 012.88 6.96c0 5.42-4.42 9.79-9.85 9.79zm5.4-7.34c-.29-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.29-.76.96-.94 1.15-.17.2-.35.22-.64.07-.29-.15-1.23-.45-2.34-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.35.44-.52.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.9-2.19-.24-.58-.48-.5-.66-.51h-.56c-.2 0-.52.07-.79.36-.27.29-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.56-.35z" />
              </svg>
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}