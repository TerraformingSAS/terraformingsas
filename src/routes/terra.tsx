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
  { icon: <HectareIcon className="text-brand-orange" />, label: "20 hectáreas", sub: "de desarrollo" },
  {
    icon: <HomeIcon className="text-brand-orange" />,
    label: "Lotes residenciales",
    sub: "100–120 m²",
  },
  {
    icon: <StoreIcon className="text-brand-orange" />,
    label: "Lotes comerciales",
    sub: "desde 70 m²",
  },
];

const FEATURES = [
  {
    icon: <WetlandIcon />,
    title: "Humedal natural",
    desc: "Un ecosistema vivo que aporta frescura, biodiversidad y tranquilidad.",
  },
  {
    icon: <GreenZonesIcon />,
    title: "Zonas verdes",
    desc: "Espacios abiertos pensados para el disfrute diario de toda la familia.",
  },
  {
    icon: <SafeIcon />,
    title: "Entorno seguro",
    desc: "Comunidad planificada con control y tranquilidad para invertir y vivir.",
  },
  {
    icon: <ValueIcon />,
    title: "Valorización",
    desc: "Un proyecto con proyección de crecimiento y plusvalía a futuro.",
  },
];

const AMENITIES = [
  { icon: <ParkIcon />, title: "Parques", desc: "Áreas verdes para el descanso y el juego." },
  { icon: <TrailIcon />, title: "Senderos", desc: "Caminos para conectar con la naturaleza." },
  { icon: <BikeIcon />, title: "Ciclovías", desc: "Movilidad activa dentro del proyecto." },
  { icon: <WetlandIcon />, title: "Humedal", desc: "Reserva natural como corazón del lugar." },
  { icon: <RecIcon />, title: "Zonas recreativas", desc: "Espacios para deporte y ocio." },
  { icon: <MeetIcon />, title: "Zonas de encuentro", desc: "Lugares para compartir en comunidad." },
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
            <Reveal>
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={natureImg}
                  alt="Naturaleza y bienestar en TERRA"
                  className="w-full h-[420px] sm:h-[520px] object-cover"
                  loading="lazy"
                  width={1600}
                  height={1066}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/40 to-transparent" />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="relative">
                <div className="rounded-xl bg-brand-navy text-white p-8 sm:p-10 shadow-xl">
                  <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand-orange">
                    Naturaleza y bienestar real
                  </div>
                  <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold leading-tight">
                    Un humedal natural como corazón del proyecto
                  </h2>
                  <p className="mt-5 text-white/80 leading-relaxed">
                    TERRA integra un humedal que aporta frescura, biodiversidad y un entorno
                    único para vivir e invertir. Aquí la naturaleza no es un accesorio: es el
                    centro de la experiencia.
                  </p>
                  <a
                    href={WA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-orange hover:brightness-110"
                  >
                    Conocer más del proyecto
                    <ArrowIcon />
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 3. Four-icon feature row */}
        <section id="ubicacion" className="py-16 sm:py-20 bg-brand-gray">
          <div className="container-tf">
            <Reveal>
              <div className="max-w-2xl mx-auto text-center mb-12">
                <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand-orange">
                  Beneficios del entorno
                </div>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-brand-navy">
                  Diseñado para vivir mejor
                </h2>
              </div>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i * 70}>
                  <div className="text-center px-4 py-6">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-navy text-brand-orange">
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
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            width={1920}
            height={1049}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/55 to-brand-navy/15" />
          <div className="relative container-tf py-16 sm:py-20 text-white">
            <Reveal>
              <div className="max-w-xl">
                <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand-orange">
                  Zona comercial
                </div>
                <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold leading-tight">
                  Lotes comerciales desde 70 m²
                </h2>
                <p className="mt-4 text-white/85 leading-relaxed">
                  Espacios pensados para emprender y servir a la comunidad, con alta
                  visibilidad y proyección de valorización.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 5. Residential lots full-bleed */}
        <section className="relative min-h-[70vh] flex items-end overflow-hidden">
          <img
            src={residentialImg}
            alt="Lotes residenciales TERRA"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            width={1920}
            height={1280}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/50 to-transparent" />
          <div className="relative container-tf py-16 sm:py-20 text-white">
            <Reveal>
              <div className="max-w-xl ml-auto text-right">
                <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand-orange">
                  Lotes residenciales
                </div>
                <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold leading-tight">
                  Tu hogar entre 100 y 120 m²
                </h2>
                <p className="mt-4 text-white/85 leading-relaxed">
                  Lotes ideales para construir el hogar que imaginas, en un entorno natural
                  y una comunidad en crecimiento.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 6. Wetland feature reversed */}
        <section id="beneficios" className="py-20 sm:py-28 bg-white">
          <div className="container-tf grid gap-10 lg:grid-cols-2 lg:gap-14 items-center">
            <Reveal className="lg:order-2">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={wetlandImg}
                  alt="Humedal natural del proyecto TERRA"
                  className="w-full h-[420px] sm:h-[520px] object-cover"
                  loading="lazy"
                  width={1600}
                  height={1201}
                />
              </div>
            </Reveal>
            <Reveal delay={120} className="lg:order-1">
              <div className="rounded-xl bg-brand-navy text-white p-8 sm:p-10 shadow-xl">
                <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand-orange">
                  Humedal TERRA
                </div>
                <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold leading-tight">
                  Biodiversidad que eleva tu calidad de vida
                </h2>
                <p className="mt-5 text-white/80 leading-relaxed">
                  El humedal es un activo ambiental del proyecto: refresca el entorno,
                  atrae vida silvestre y ofrece un paisaje que pocos desarrollos pueden
                  ofrecer. Invertir en TERRA es invertir en un lugar con identidad.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 7. Amenities grid */}
        <section className="py-20 sm:py-28 bg-brand-gray">
          <div className="container-tf">
            <Reveal>
              <div className="max-w-2xl mb-12">
                <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand-orange">
                  Amenidades
                </div>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-brand-navy">
                  Todo lo que necesitas, cerca de ti
                </h2>
                <p className="mt-4 text-brand-dark/75 leading-relaxed">
                  Siete espacios pensados para el bienestar, la movilidad y la vida en comunidad.
                </p>
              </div>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {AMENITIES.map((a, i) => (
                <Reveal key={a.title} delay={i * 50}>
                  <div className="flex gap-4 rounded-xl bg-white p-5 border border-border/80 transition-shadow hover:shadow-md">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-brand-orange">
                      {a.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-navy">{a.title}</h3>
                      <p className="mt-1 text-sm text-brand-dark/70 leading-relaxed">{a.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Dark navy footer CTA */}
        <section id="contacto" className="bg-brand-navy text-white py-20 sm:py-24">
          <div className="container-tf text-center">
            <Reveal>
              <div className="flex justify-center">
                <TerraMark className="items-center text-center" />
              </div>
              <h2 className="mt-8 font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight max-w-2xl mx-auto">
                ¿Listo para ser parte de TERRA?
              </h2>
              <p className="mt-4 text-white/75 max-w-lg mx-auto">
                Escríbenos y te compartimos disponibilidad, planos y formas de inversión.
              </p>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-9 inline-flex items-center gap-3 rounded-md bg-[#25D366] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 hover:-translate-y-0.5"
              >
                <WhatsAppIcon />
                +57 321 423 0090 Escríbenos por WhatsApp
                <ArrowIcon />
              </a>
            </Reveal>

            <div className="mt-16 grid gap-8 sm:grid-cols-3 max-w-3xl mx-auto">
              {[
                { icon: <PhoneIcon />, label: "Llámanos", value: "321 423 0090", href: TEL_HREF },
                { icon: <WhatsAppIcon />, label: "WhatsApp", value: "+57 321 423 0090", href: WA_URL },
                {
                  icon: <HomeIcon />,
                  label: "Proyecto",
                  value: "TERRA — lotes",
                  href: "#inicio",
                },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-brand-orange">
                    {item.icon}
                  </span>
                  <span className="text-[11px] tracking-[0.18em] uppercase text-white/50">{item.label}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </a>
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
