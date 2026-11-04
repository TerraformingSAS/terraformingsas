import aerialImg from "@/assets/terra/render-aereo.webp";
import blocksImg from "@/assets/terra/render-manzanas.webp";
import roadsImg from "@/assets/terra/render-vias.webp";

const ITEMS = [
  {
    title: "Entorno",
    image: aerialImg,
    alt: "Render ilustrativo del predio de TERRA y su entorno natural en Popayán",
  },
  {
    title: "Manzanas proyectadas",
    image: blocksImg,
    alt: "Render ilustrativo de las manzanas D, E y F de TERRA Etapa I",
  },
  {
    title: "Vías y zonas verdes",
    image: roadsImg,
    alt: "Render ilustrativo de vías, zonas verdes y espacios de encuentro proyectados en TERRA",
  },
] as const;

export function ProjectGallery() {
  return (
    <section id="naturaleza" className="scroll-mt-24 bg-white py-14 sm:py-20">
      <div className="container-tf">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-orange">
          Naturaleza y espacios
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-brand-navy">
          El paisaje organiza el proyecto
        </h2>
        <p className="mt-3 max-w-xl text-sm text-brand-dark/75">
          Renders ilustrativos. Humedal, zonas verdes, senderos, ciclovías y zona comercial están
          proyectados.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {ITEMS.map((item) => (
            <li key={item.title}>
              <figure>
                <img
                  src={item.image}
                  alt={item.alt}
                  className="aspect-[4/3] w-full object-cover"
                  width={1600}
                  height={900}
                  loading="lazy"
                />
                <figcaption className="mt-2 text-sm font-medium text-brand-navy">
                  {item.title}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
