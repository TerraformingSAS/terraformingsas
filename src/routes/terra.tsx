import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { TerraMark } from "@/components/terra/TerraMark";
import {
  ArrowIcon,
  BikeIcon,
  GreenZonesIcon,
  HectareIcon,
  HomeIcon,
  MeetIcon,
  ParkIcon,
  PetIcon,
  PhoneIcon,
  RecIcon,
  SafeIcon,
  StoreIcon,
  TrailIcon,
  ValueIcon,
  WetlandIcon,
  WhatsAppIcon,
} from "@/components/terra/icons";
import heroImg from "@/assets/terra/hero.jpg";
import wetlandImg from "@/assets/terra/wetland.jpg";
import natureImg from "@/assets/terra/nature-wellness.jpg";
import commercialImg from "@/assets/terra/commercial.jpg";
import residentialImg from "@/assets/terra/residential.jpg";
import footerLeavesImg from "@/assets/terra/footer-leaves.jpg";

const WA_URL =
  "https://wa.me/573214230090?text=Hola%20TERRA%2C%20quiero%20más%20información%20sobre%20el%20proyecto.";
const TEL_HREF = "tel:+573214230090";

const NAV = [
  { id: "inicio", label: "Inicio" },
  { id: "proyecto", label: "Proyecto" },
  { id: "ubicacion", label: "Ubicación" },
  { id: "beneficios", label: "Beneficios" },
  { id: "lotes", label: "Lotes" },
  { id: "contacto", label: "Contacto" },
];

const HERO_STATS = [
  { icon: <HectareIcon className="text-brand-orange" />, label: "20 hectáreas", sub: "de un gran futuro" },
  {
    icon: <HomeIcon className="text-brand-orange" />,
    label: "Lotes residenciales",
    sub: "desde 100–120 m²",
  },
  {
    icon: <StoreIcon className="text-brand-orange" />,
    label: "Lotes comerciales",
    sub: "desde 70 m² con expansión",
  },
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
  { icon: <ParkIcon />, title: "Parques y zonas verdes", desc: "Áreas verdes para el descanso y el juego." },
  { icon: <TrailIcon />, title: "Senderos peatonales", desc: "Caminos para conectar con la naturaleza." },
  { icon: <BikeIcon />, title: "Ciclovías", desc: "Movilidad activa dentro del proyecto." },
  { icon: <WetlandIcon />, title: "Humedal natural", desc: "Reserva natural como corazón del lugar." },
  { icon: <RecIcon />, title: "Zonas recreativas", desc: "Espacios para deporte y ocio." },
  { icon: <MeetIcon />, title: "Espacios de encuentro", desc: "Lugares para compartir en comunidad." },
  { icon: <PetIcon />, title: "Pet friendly", desc: "Ambientes pensados también para mascotas." },
];

export const Route = createFileRoute("/terra")({
  head: () => ({
    meta: [
      { title: "TERRA | Naturaleza que te pertenece" },
      {
        name: "description",
        content:
          "TERRA: lotes residenciales y comerciales en un proyecto con humedal natural, zonas verdes y oportunidades de valorización.",
      },
      { property: "og:title", content: "TERRA | Naturaleza que te pertenece" },
      {
        property: "og:description",
        content: "Lotes para un mejor mañana. Naturaleza, comunidad y oportunidades en un solo lugar.",
      },
    ],
  }),
  component: TerraPage,
});

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function TerraNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "bg-brand-navy/95 backdrop-blur border-b border-white/10 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container-tf flex items-center justify-between h-18 py-3">
        <button onClick={() => go("inicio")} className="shrink-0" aria-label="TERRA inicio">
          <TerraMark />
        </button>

        <nav className="hidden lg:flex items-center gap-7">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className="text-sm font-medium tracking-wide text-white/90 transition-colors hover:text-brand-orange"
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="hidden lg:block">
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 hover:shadow-md"
          >
            Quiero más información
            <ArrowIcon />
          </a>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-md text-white"
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            ) : (
              <>
                <path d="M4 7h16" strokeLinecap="round" />
                <path d="M4 12h16" strokeLinecap="round" />
                <path d="M4 17h16" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/10 bg-brand-navy">
          <div className="container-tf py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className="text-left py-3 px-2 text-white font-medium rounded hover:bg-white/5"
              >
                {n.label}
              </button>
            ))}
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 rounded-md bg-brand-orange px-5 py-3 text-sm font-semibold text-white text-center"
            >
              Quiero más información →
            </a>
            <Link to="/" className="mt-1 py-3 px-2 text-sm text-white/70 hover:text-white">
              ← Volver a TERRA FORMING
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function TerraPage() {
  return (
    <div className="min-h-screen bg-white text-brand-navy">
      <TerraNav />
      <main>
        {/* 1. Hero */}
        <section id="inicio" className="relative min-h-screen w-full overflow-hidden">
          <img
            src={heroImg}
            alt="Vista aérea del desarrollo TERRA al atardecer"
            className="absolute inset-0 h-full w-full object-cover"
            width={1920}
            height={1118}
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0E2A47]/88 via-[#0E2A47]/65 to-[#0E2A47]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E2A47]/90 via-[#0E2A47]/25 to-transparent" />

          <div className="relative container-tf flex min-h-screen flex-col justify-end pt-28 pb-16 text-white">
            <Reveal>
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-brand-orange">
                  <span className="h-px w-8 bg-brand-orange" />
                  Un proyecto único
                </div>
                <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
                  Lotes para un <span className="text-brand-orange">mejor mañana</span>
                </h1>
                <p className="mt-5 max-w-xl text-base sm:text-lg text-white/85 leading-relaxed">
                  Naturaleza, comunidad y oportunidades en un solo lugar.
                </p>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-3 sm:grid-cols-3 max-w-3xl">
              {HERO_STATS.map((s, i) => (
                <Reveal key={s.label} delay={80 + i * 70}>
                  <div className="rounded-lg border border-white/15 bg-white/10 backdrop-blur-md px-5 py-4">
                    <div className="flex items-center gap-3">
                      {s.icon}
                      <div>
                        <div className="text-sm font-semibold text-white">{s.label}</div>
                        <div className="text-xs text-white/70">{s.sub}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={280}>
              <div className="mt-8">
                <a
                  href={TEL_HREF}
                  className="inline-flex items-center gap-2 rounded-md bg-brand-orange px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/25 transition-all hover:brightness-110 hover:-translate-y-0.5"
                >
                  <PhoneIcon />
                  Quiero más información
                  <ArrowIcon />
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 2. Naturaleza y bienestar */}
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
                  TERRA integra un entorno natural excepcional con espacios para vivir, invertir
                  y crecer. El paisaje, el humedal y la comunidad se encuentran en un solo
                  proyecto pensado para el largo plazo.
                </p>
              </div>
            </Reveal>
            <Reveal className="order-1 lg:order-2">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={natureImg}
                  alt="Humedal natural en TERRA"
                  className="w-full h-[420px] sm:h-[520px] object-cover"
                  loading="lazy"
                  width={1600}
                  height={900}
                />
                <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
                  <div className="inline-flex items-center gap-3 rounded-lg bg-brand-navy/90 px-4 py-3 text-white shadow-lg backdrop-blur">
                    <WetlandIcon className="text-brand-orange shrink-0" />
                    <div>
                      <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-brand-orange">
                        Humedal natural
                      </div>
                      <p className="text-sm text-white/90">Un ecosistema que te conecta con la vida.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 3. Four-icon feature row */}
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

        {/* 4. Commercial zone full-bleed */}
        <section id="lotes" className="relative min-h-[70vh] flex items-end overflow-hidden">
          <img
            src={commercialImg}
            alt="Zona comercial TERRA"
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="lazy"
            width={1920}
            height={900}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/70 to-brand-navy/20" />
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
                  Lotes comerciales desde 70 m² con posibilidad de expansión, ideales para
                  negocios, servicios y experiencias que complementan la vida del proyecto.
                </p>
                <div className="mt-8 inline-flex items-center gap-3 rounded-lg bg-brand-navy/80 border border-white/10 px-4 py-3 backdrop-blur">
                  <StoreIcon className="text-brand-orange" />
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-brand-orange">
                      Zona comercial
                    </div>
                    <p className="text-sm text-white/90">Ubicación estratégica con parqueaderos y alto flujo.</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 5. Residential lots full-bleed */}
        <section className="relative min-h-[70vh] flex items-end overflow-hidden">
          <img
            src={residentialImg}
            alt="Lotes residenciales TERRA"
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="lazy"
            width={1920}
            height={900}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/65 to-transparent" />
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
                  Lotes desde 100–120 m² en un entorno natural, con todas las comodidades y la
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

        {/* 6. Wetland feature reversed */}
        <section id="beneficios" className="py-20 sm:py-28 bg-white">
          <div className="container-tf grid gap-10 lg:grid-cols-2 lg:gap-14 items-center">
            <Reveal>
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={wetlandImg}
                  alt="Humedal natural del proyecto TERRA"
                  className="w-full h-[420px] sm:h-[520px] object-cover"
                  loading="lazy"
                  width={1600}
                  height={900}
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

        {/* 7. Amenities grid */}
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
                    <h3 className="mt-4 text-sm font-semibold text-brand-navy leading-snug">{a.title}</h3>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Dark footer CTA with leaves */}
        <section id="contacto" className="relative overflow-hidden text-white py-20 sm:py-24">
          <img
            src={footerLeavesImg}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            width={1600}
            height={800}
            aria-hidden
          />
          <div className="absolute inset-0 bg-brand-navy/88" />
          <div className="relative container-tf">
            <Reveal>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
                <TerraMark />
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

            <div className="mt-16 grid gap-8 sm:grid-cols-3 max-w-3xl mx-auto">
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

            <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/55">
              <p>© 2026 TERRA — Un proyecto de TERRA FORMING S.A.S.</p>
              <Link to="/" className="hover:text-white transition-colors">
                Volver a terraformings.co
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
