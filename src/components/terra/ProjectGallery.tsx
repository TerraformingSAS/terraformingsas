import commercialImg from "@/assets/terra/zona-comercial.png";
import wetlandImg from "@/assets/terra/humedal-natural.png";
import aerialImg from "@/assets/terra/section-aerial.jpg";
import benchImg from "@/assets/terra/section-pond-bench.jpg";
import { Reveal } from "@/components/Reveal";
import { TerraCaption, TerraKicker } from "@/components/terra/primitives";
import { TERRA_COPY } from "@/lib/terra/commercial";

const ITEMS = [
  {
    title: "Humedal natural",
    status: "Entorno existente",
    image: wetlandImg,
    alt: "Render ilustrativo del humedal previsto como corazón natural de TERRA",
    wide: true,
  },
  {
    title: "Zonas verdes",
    status: "Proyectadas",
    image: aerialImg,
    alt: "Render aéreo ilustrativo de las zonas verdes de TERRA",
  },
  {
    title: "Senderos y ciclovías",
    status: "Proyectados",
    image: benchImg,
    alt: "Render ilustrativo de un espacio de encuentro junto al agua en TERRA",
  },
  {
    title: "Parques y encuentros",
    status: "Proyectados",
    image: wetlandImg,
    alt: "Render ilustrativo de áreas de contemplación junto al humedal",
  },
  {
    title: "Zona comercial",
    status: "Proyectada",
    image: commercialImg,
    alt: "Render ilustrativo de la zona comercial proyectada de TERRA",
    wide: true,
  },
] as const;

export function ProjectGallery() {
  return (
    <section id="naturaleza" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="container-tf">
        <Reveal>
          <div className="max-w-2xl">
            <TerraKicker>Naturaleza y espacios</TerraKicker>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-brand-navy sm:text-4xl">
              Un predio organizado alrededor del paisaje
            </h2>
            <p className="mt-4 text-brand-dark/80">
              El humedal y las zonas verdes dan carácter al proyecto. Los senderos, ciclovías,
              parques y la zona comercial se muestran como parte del desarrollo previsto.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {ITEMS.map((item, index) => (
            <figure key={item.title} className={item.wide ? "md:col-span-2" : undefined}>
              <Reveal delay={index * 40}>
                <div className="relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.alt}
                    className={
                      item.wide
                        ? "h-[280px] w-full object-cover sm:h-[420px]"
                        : "h-[280px] w-full object-cover"
                    }
                    loading="lazy"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-navy/80 to-transparent p-5 text-white">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/75">
                      {item.status}
                    </p>
                    <p className="mt-1 font-display text-xl font-semibold">{item.title}</p>
                  </figcaption>
                </div>
                <TerraCaption>
                  {item.status === "Entorno existente"
                    ? TERRA_COPY.renderCaption
                    : TERRA_COPY.projectedCaption}
                </TerraCaption>
              </Reveal>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
