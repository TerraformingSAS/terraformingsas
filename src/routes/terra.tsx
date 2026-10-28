import heroImg from "@/assets/terra/hero-bg-gradient.png";
import wetlandImg from "@/assets/terra/humedal-natural.png";
import cierreImg from "@/assets/terra/seccion-final.png";
import aerialImg from "@/assets/terra/section-aerial.jpg";
import commercialImg from "@/assets/terra/zona-comercial.png";
import { BackToTop } from "@/components/BackToTop";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Reveal } from "@/components/Reveal";
import {
  ArrowIcon,
  BikeIcon,
  GreenZonesIcon,
  HomeIcon,
  MeetIcon,
  ParkIcon,
  PetIcon,
  RecIcon,
  SafeIcon,
  StoreIcon,
  TrailIcon,
  ValueIcon,
  WetlandIcon,
  WhatsAppIcon,
} from "@/components/terra/icons";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { TerraLeadForm } from "@/components/terra/TerraLeadForm";
import { createFileRoute } from "@tanstack/react-router";

const WA_URL =
  "https://wa.me/573214230090?text=Hola%20TERRA%2C%20quiero%20más%20información%20sobre%20el%20proyecto.";

const MAP_URL =
  "https://www.google.com/maps/d/u/0/edit?mid=1W2I5RfshHNClX4RHmQsCxKhD0VJ12TY&usp=sharing";

const HERO_OFFERS = [
  { value: "$5", unit: "millones", label: "Separa tu lote" },
  { value: "70%", unit: "", label: "Te financiamos" },
  { value: "30%", unit: "", label: "Paga a la entrega" },
];

const FEATURES = [
  {
    icon: <WetlandIcon />,
    title: "Humedal natural",
    desc: "Como corazón del proyecto: vida, frescura y biodiversidad.",
  },
  {
    icon: <GreenZonesIcon />,
    title: "Amplias zonas verdes",
    desc: "Espacios comunes abiertos para el disfrute diario.",
  },
  {
    icon: <SafeIcon />,
    title: "Un entorno seguro",
    desc: "Comunidad planificada para vivir e invertir con tranquilidad.",
  },
  {
    icon: <ValueIcon />,
    title: "Alta valorización",
    desc: "Proyección de crecimiento y plusvalía a futuro.",
  },
];

const AMENITIES = [
  { icon: <ParkIcon />, title: "Parques y zonas verdes" },
  { icon: <TrailIcon />, title: "Senderos peatonales" },
  { icon: <BikeIcon />, title: "Ciclovías" },
  { icon: <WetlandIcon />, title: "Humedal natural" },
  { icon: <RecIcon />, title: "Zonas recreativas" },
  { icon: <MeetIcon />, title: "Espacios de encuentro" },
  { icon: <PetIcon />, title: "Pet friendly" },
];

export const Route = createFileRoute("/terra")({
  head: () => ({
    meta: [
      { title: "TERRA | Naturaleza que te pertenece" },
      {
        name: "description",
        content:
          "TERRA: lotes residenciales y locales comerciales en un proyecto con humedal natural, zonas verdes y oportunidades de valorización.",
      },
      { property: "og:title", content: "TERRA | Naturaleza que te pertenece" },
      {
        property: "og:description",
        content:
          "Lotes para un mejor mañana. Naturaleza, comunidad y oportunidades en un solo lugar.",
      },
    ],
  }),
  component: TerraPage,
});

function TerraPage() {
  return (
    <div className="min-h-screen bg-white text-brand-navy">
      {/* Same site header as home: Terraforming logo + nav + TERRA CTA */}
      <Header />
      <main>
        {/* Terra hero content (below shared header); gradient baked into photo */}
        <section id="inicio" className="relative w-full overflow-hidden">
          <img
            src={heroImg}
            alt="Vista aérea del desarrollo TERRA al atardecer"
            className="absolute inset-0 h-full w-full object-cover object-center"
            width={1550}
            height={1015}
            fetchPriority="high"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-navy/55 via-brand-navy/25 to-brand-navy/10" />

          <div className="relative container-tf grid items-start gap-8 pt-20 pb-12 text-white sm:pb-14 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] lg:gap-12 lg:pb-16">
            <div className="min-w-0">
              <Reveal>
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-white">
                    <span className="h-px w-8 bg-brand-orange" />
                    <span className="text-white/95">Un proyecto único</span>
                  </div>
                  <h1 className="mt-3 font-display text-[2rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.15rem]">
                    Separa tu lote con solo{" "}
                    <span className="text-brand-orange">$5 millones</span>
                  </h1>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/90 sm:text-base">
                    Te financiamos el 70% del valor de tu lote y pagas el 30% restante a la entrega.
                  </p>
                </div>
              </Reveal>

              <div className="mt-6 flex max-w-xl flex-col gap-3">
                {HERO_OFFERS.map((offer, i) => (
                  <Reveal key={offer.value} delay={70 + i * 60}>
                    <div className="flex items-center gap-4 rounded-2xl border border-white/30 bg-white/10 px-4 py-4 shadow-[0_12px_32px_rgba(8,24,40,0.22)] backdrop-blur-md sm:gap-6 sm:px-5 sm:py-5">
                      <p className="min-w-[6.5rem] shrink-0 font-display text-4xl font-bold leading-none tracking-tight text-white sm:min-w-[8.5rem] sm:text-5xl">
                        {offer.value}
                        {offer.unit ? (
                          <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-orange sm:text-xs">
                            {offer.unit}
                          </span>
                        ) : null}
                      </p>
                      <p className="text-base font-medium leading-snug text-white sm:text-lg">
                        {offer.label}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="mt-6">
                <p className="max-w-xl text-[11px] leading-relaxed text-white/75 sm:text-xs">
                  20 hectáreas · Lotes residenciales · Locales comerciales. Lotes para un mejor mañana:
                  naturaleza, comunidad y oportunidades en un solo lugar.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                  <a
                    href="/terra/estado"
                    className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-white underline-offset-4 transition hover:text-brand-orange hover:underline"
                  >
                    Ver lotes disponibles
                    <ArrowIcon />
                  </a>
                  <a
                    href={WA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-white/85 transition hover:text-white"
                  >
                    <WhatsAppIcon />
                    Quiero más información
                  </a>
                </div>
              </div>
            </div>
            <Reveal
              delay={160}
              className="w-full max-w-[400px] justify-self-center lg:justify-self-end"
            >
              <TerraLeadForm />
            </Reveal>
          </div>
        </section>

        {/* Naturaleza y bienestar */}
        <section id="proyecto" className="py-20 sm:py-28 bg-white">
          <div className="container-tf grid gap-10 lg:grid-cols-2 lg:gap-14 items-center">
            <Reveal delay={80} className="order-2 lg:order-1">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-brand-orange">
                  <span className="h-px w-8 bg-brand-orange" />
                  Un lugar donde todo conecta
                </div>
                <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold leading-tight text-brand-navy">
                  Naturaleza y bienestar real
                </h2>
                <p className="mt-5 text-brand-dark/80 leading-relaxed max-w-xl">
                  TERRA integra un entorno natural excepcional con espacios para vivir, invertir y
                  crecer. El paisaje, el humedal y la comunidad se encuentran en un solo proyecto
                  pensado para el largo plazo.
                </p>
                <a
                  href={MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-navy underline-offset-4 transition hover:text-brand-orange hover:underline"
                >
                  Ver el mapa del proyecto
                  <ArrowIcon />
                </a>
              </div>
            </Reveal>
            <Reveal className="order-1 lg:order-2">
              <a
                href={MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block overflow-hidden rounded-xl"
                aria-label="Abrir el mapa del proyecto TERRA"
              >
                <img
                  src={wetlandImg}
                  alt="Humedal natural TERRA al atardecer con deck de madera"
                  className="w-full h-[420px] sm:h-[520px] object-cover"
                  loading="lazy"
                  width={1579}
                  height={996}
                />
                {/* Navy fade only under the caption card on the photo */}
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-brand-navy/70 via-brand-navy/25 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
                  <div className="inline-flex items-center gap-3 rounded-lg bg-brand-navy/90 px-4 py-3 text-white shadow-lg backdrop-blur">
                    <WetlandIcon className="text-brand-orange shrink-0" />
                    <div>
                      <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-brand-orange">
                        Humedal natural
                      </div>
                      <p className="text-sm text-white/90">
                        Un ecosistema que te conecta con la vida.
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            </Reveal>
          </div>
        </section>

        <section id="ubicacion" className="py-16 sm:py-20 bg-brand-gray">
          <div className="container-tf">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i * 70}>
                  <div className="text-center px-4 py-6">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-brand-navy/15 bg-white text-brand-navy">
                      {f.icon}
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-brand-navy">{f.title}</h3>
                    <p className="mt-2 text-sm text-brand-dark/75 leading-relaxed">{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="lotes" className="relative min-h-[70vh] flex items-end overflow-hidden">
          <img
            src={commercialImg}
            alt="Zona comercial TERRA al atardecer"
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="lazy"
            width={2017}
            height={780}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/70 to-brand-navy/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/50 via-transparent to-transparent" />
          <div className="relative container-tf py-16 sm:py-20 text-white">
            <Reveal>
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-brand-orange">
                  <span className="h-px w-8 bg-brand-orange" />
                  Zona comercial
                </div>
                <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold leading-tight">
                  Espacios que impulsan <span className="text-brand-orange">tu crecimiento</span>
                </h2>
                <p className="mt-4 text-white/85 leading-relaxed">
                  Locales comerciales ideales para negocios, servicios y experiencias que
                  complementan la vida del proyecto.
                </p>
                <div className="mt-8 inline-flex items-center gap-3 rounded-lg bg-brand-navy/80 border border-white/10 px-4 py-3 backdrop-blur">
                  <StoreIcon className="text-brand-orange" />
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-brand-orange">
                      Zona comercial
                    </div>
                    <p className="text-sm text-white/90">
                      Ubicación estratégica con parqueaderos y alto flujo.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative min-h-[70vh] flex items-end overflow-hidden">
          <img
            src={aerialImg}
            alt="Vista aérea de lotes residenciales TERRA"
            className="absolute inset-0 h-full w-full object-cover object-[center_70%]"
            loading="lazy"
            width={1550}
            height={1015}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/65 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/45 via-transparent to-transparent" />
          <div className="relative container-tf py-16 sm:py-20 text-white">
            <Reveal>
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-brand-orange">
                  <span className="h-px w-8 bg-brand-orange" />
                  Lotes residenciales
                </div>
                <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold leading-tight">
                  Espacio para construir <span className="text-brand-orange">tu historia</span>
                </h2>
                <p className="mt-4 text-white/85 leading-relaxed">
                  Lotes residenciales en un entorno natural, con todas las comodidades y la
                  tranquilidad que tu familia merece.
                </p>
                <div className="mt-8 inline-flex items-center gap-3 rounded-lg bg-brand-navy/80 border border-white/10 px-4 py-3 backdrop-blur">
                  <HomeIcon className="text-brand-orange" />
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-brand-orange">
                      Lotes residenciales
                    </div>
                    <p className="text-sm text-white/90">Diseña el futuro que imaginas.</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="beneficios" className="py-20 sm:py-28 bg-white">
          <div className="container-tf grid gap-10 lg:grid-cols-2 lg:gap-14 items-center">
            <Reveal>
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={wetlandImg}
                  alt="Humedal natural TERRA con árboles rosados y deck"
                  className="w-full h-[420px] sm:h-[520px] object-cover object-center"
                  loading="lazy"
                  width={1579}
                  height={996}
                />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-brand-orange">
                  <span className="h-px w-8 bg-brand-orange" />
                  Humedal natural
                </div>
                <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold leading-tight text-brand-navy">
                  Un ecosistema que te conecta
                </h2>
                <p className="mt-5 text-brand-dark/80 leading-relaxed">
                  Nuestro humedal es el corazón de TERRA: un espacio de vida, biodiversidad y
                  bienestar que crea un entorno único y sostenible.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="py-20 sm:py-28 bg-brand-gray">
          <div className="container-tf">
            <Reveal>
              <div className="mb-12 flex items-center justify-center gap-4 text-center">
                <span className="hidden sm:block h-px w-16 bg-brand-orange" />
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy tracking-wide uppercase">
                  Amenidades pensadas para ti
                </h2>
                <span className="hidden sm:block h-px w-16 bg-brand-orange" />
              </div>
            </Reveal>
            <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
              {AMENITIES.map((a, i) => (
                <Reveal key={a.title} delay={i * 50}>
                  <div className="flex flex-col items-center text-center px-2 py-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-navy text-brand-navy bg-white">
                      {a.icon}
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-brand-navy leading-snug">
                      {a.title}
                    </h3>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Closing band — TERRA wordmark baked into the left of the image; copy/CTA on the navy right */}
        <section
          id="contacto"
          className="relative overflow-hidden text-white py-20 sm:py-24 min-h-[420px] flex items-center"
        >
          <img
            src={cierreImg}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-left"
            loading="lazy"
            width={1921}
            height={819}
            aria-hidden
          />
          <div className="relative container-tf w-full">
            <Reveal>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-10">
                {/* Spacer keeps the baked-in TERRA mark on the left uncovered */}
                <div className="hidden lg:block lg:flex-1 min-h-[120px]" aria-hidden />
                <div className="max-w-xl lg:text-right">
                  <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                    Sé parte de un lugar donde todo empieza mejor.
                  </h2>
                  <a
                    href={WA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-flex items-center gap-3 rounded-md bg-[#25D366] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 hover:-translate-y-0.5"
                  >
                    <WhatsAppIcon />
                    +57 321 423 0090 Escríbenos por WhatsApp
                    <ArrowIcon />
                  </a>
                </div>
              </div>
            </Reveal>

            <div className="mt-14 grid gap-8 sm:grid-cols-3 max-w-3xl ml-auto">
              {[
                { icon: <WetlandIcon />, label: "Vive la naturaleza" },
                { icon: <MeetIcon />, label: "Construye comunidad" },
                { icon: <ValueIcon />, label: "Invierte en tu futuro" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-3 text-white/85">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium text-center">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
      <BackToTop />
    </div>
  );
}
