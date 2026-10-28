export const TERRA_LEGAL_NOTICE_PATH = "/terra/avisolegal";

const paragraph = "mt-4 text-sm leading-relaxed text-brand-dark/80 sm:text-[15px] sm:leading-7";

export function TerraLegalNoticeBody() {
  return (
    <div>
      <p className={paragraph}>
        TERRA es una iniciativa inmobiliaria que actualmente se encuentra en fase de
        estructuración, diseño y preventa preliminar. Los promotores del proyecto son
        propietarios del predio sobre el cual se proyecta su desarrollo.
      </p>
      <p className={paragraph}>
        A la fecha, el proyecto adelanta los estudios, diseños y demás documentos técnicos
        necesarios para su próxima radicación y gestión de las autorizaciones que resulten
        aplicables ante las autoridades competentes.
      </p>
      <p className={paragraph}>
        La información presentada, incluyendo imágenes, renders, planos conceptuales, áreas
        estimadas, distribución proyectada, número de unidades, infraestructura, vías,
        servicios, zonas comunes y cronogramas, tiene carácter preliminar e ilustrativo y podrá
        modificarse como resultado de los estudios técnicos, decisiones de diseño, requerimientos
        de las autoridades competentes o condiciones propias del proyecto.
      </p>
      <p className={paragraph}>
        La eventual ubicación, delimitación, área y características de los lotes proyectados
        podrán variar conforme al resultado de los estudios técnicos y de las autorizaciones que
        resulten aplicables.
      </p>
      <p className={paragraph}>
        La información suministrada no constituye oferta comercial, promesa de compraventa ni
        garantía de aprobación urbanística, otorgamiento de licencias, configuración definitiva
        del proyecto, escrituración o entrega en una fecha determinada.
      </p>
      <p className={paragraph}>
        Sobre los valores de separación: los valores que los interesados entreguen en esta etapa
        a título de separación se recibirán con carácter preliminar y reembolsable. En caso de
        que el proyecto no obtenga las autorizaciones aplicables, dichos valores serán devueltos
        al interesado conforme a las condiciones enviadas a los interesados.
      </p>
      <p className={paragraph}>
        Toda vinculación de reserva o negocio jurídico estará sujeta a los términos
        contractuales aplicables y a las condiciones que se establezcan en los respectivos
        documentos.
      </p>
      <p className={paragraph}>
        Responsable del proyecto: TERRA FORMING S.A.S. Calle 10 # 4 - 40, Oficina 1001, Cali,
        Valle del Cauca.{" "}
        <a className="underline underline-offset-4 hover:text-brand-orange" href="https://www.terraformings.co">
          www.terraformings.co
        </a>
      </p>
    </div>
  );
}
