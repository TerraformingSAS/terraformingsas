import logo from "@/assets/logo_blanco.png";

export function Footer() {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <footer className="bg-brand-navy text-white pt-20 pb-8">
      <div className="container-tf grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          
          <img src={logo} alt="TERRA FORMING" className="h-12 w-auto" width={300} height={83} />
          
          <p className="mt-5 text-sm text-white/70 leading-relaxed max-w-xs">
            TERRA FORMING S.A.S. — Ingeniería, construcción e infraestructura.
            Transformamos el terreno en oportunidades.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-widest uppercase text-brand-orange">Enlaces</h4>
          <ul className="mt-5 space-y-2.5 text-sm text-white/75">
            {[["nosotros","Nosotros"],["servicios","Servicios"],["sectores","Sectores"],["diferenciales","Diferenciales"],["proyectos","Proyectos"],["cobertura","Cobertura"],["contacto","Contacto"]].map(([id, l]) => (
              <li key={id}>
                <button onClick={() => go(id)} className="hover:text-brand-orange transition-colors text-left">
                  {l}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-widest uppercase text-brand-orange">Servicios</h4>
          <ul className="mt-5 space-y-2.5 text-sm text-white/75">
            <li>Infraestructura vial</li>
            <li>Acueductos y alcantarillados</li>
            <li>Urbanismo y espacio público</li>
            <li>Vivienda y desarrollo urbano</li>
            <li>Movimiento de tierras</li>
            <li>Alumbrado público</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-widest uppercase text-brand-orange">Contacto</h4>
          <ul className="mt-5 space-y-3 text-sm text-white/75">
            <li>Cali, Valle del Cauca, Colombia</li>
            <li>
              <a href="mailto:gerencia@terraformings.co" className="hover:text-white">gerencia@terraformings.co</a>
            </li>
            <li>
              <a href="tel:+573112363149" className="hover:text-white">311 236 3149</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-tf mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-white/60">
        <p>© 2026 TERRA FORMING S.A.S. Todos los derechos reservados.</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a href="#" className="hover:text-white">Política de privacidad</a>
          <a href="#" className="hover:text-white">Tratamiento de datos</a>
        </div>
      </div>
    </footer>
  );
}