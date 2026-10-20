import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/politica-de-privacidad")({
  head: () => ({
    meta: [
      { title: "Política de datos y privacidad | TERRA FORMING" },
      {
        name: "description",
        content:
          "Conoce cómo TERRA FORMING S.A.S. recolecta, utiliza y protege tus datos personales y cómo ejercer tus derechos.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

const paragraph = "mt-3 text-[15px] leading-8 text-brand-dark/85";
const heading = "font-display text-xl font-bold leading-snug text-brand-navy sm:text-2xl";

function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-brand-navy">
      <Header solid />
      <main className="mx-auto w-full max-w-[860px] flex-1 px-5 pb-20 pt-32 sm:px-8 sm:pb-28 sm:pt-36">
        <article className="space-y-10">
          <div>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Política de tratamiento de datos personales y privacidad
            </h1>
            <p className="mt-4 text-sm text-brand-dark/70">
              TERRA FORMING S.A.S. · Última actualización: 20 de octubre de 2026
            </p>
            <p className={paragraph}>
              Para TERRA FORMING S.A.S. es importante respetar la privacidad de quienes visitan
              nuestro sitio web, solicitan información sobre nuestros servicios o consultan el
              proyecto TERRA. Esta política explica qué información personal tratamos, para
              qué la utilizamos y cómo puedes ejercer tus derechos de acuerdo con la Ley 1581
              de 2012 y las normas que la reglamentan, incluido el Decreto 1074 de 2015.
            </p>
          </div>

          <section aria-labelledby="privacidad-responsable">
            <h2 id="privacidad-responsable" className={heading}>1. Responsable del tratamiento</h2>
            <p className={paragraph}>
              El responsable del tratamiento de los datos personales es TERRA FORMING S.A.S.,
              con domicilio de contacto en Calle 10 # 4 - 40, Oficina 1001, Edificio Bolsa de
              Occidente, barrio San Pedro, Cali, Valle del Cauca, Colombia.
            </p>
            <p className={paragraph}>
              Para consultas, solicitudes y reclamos relacionados con tus datos personales puedes
              escribir a <a className="underline underline-offset-4 hover:text-brand-orange" href="mailto:gerencia@terraformings.co">gerencia@terraformings.co</a> o
              a <a className="underline underline-offset-4 hover:text-brand-orange" href="mailto:mercadeo@terraformings.co">mercadeo@terraformings.co</a>,
              o comunicarte al teléfono +57 321 423 0090.
            </p>
            <p className={paragraph}>
              El área encargada de la atención de peticiones, consultas y reclamos, y ante la
              cual el titular puede ejercer sus derechos a conocer, actualizar, rectificar
              y suprimir sus datos y revocar la autorización, es el área de Mercadeo.
            </p>
          </section>

          <section aria-labelledby="privacidad-alcance">
            <h2 id="privacidad-alcance" className={heading}>2. Alcance de la política</h2>
            <p className={paragraph}>
              Esta política aplica a los datos personales recibidos mediante nuestro sitio web
              terraformings.co, los formularios de contacto y preventa, las solicitudes de
              información o cotización y los canales de comunicación asociados a TERRA FORMING.
              El tratamiento se realiza conforme a las finalidades informadas al titular,
              con criterios de legalidad, finalidad, transparencia, acceso restringido y seguridad.
            </p>
          </section>

          <section aria-labelledby="privacidad-datos">
            <h2 id="privacidad-datos" className={heading}>3. Información que podemos recopilar</h2>
            <p className={paragraph}>
              Según el canal utilizado, podemos recibir nombres y apellidos, número y tipo de
              documento, correo electrónico, teléfono o WhatsApp, empresa o entidad,
              tipo de proyecto, mensajes, interés en lotes y datos necesarios para atender
              solicitudes comerciales. En preventa también puedes indicar, de forma opcional,
              quién te contó del proyecto. Si compartes el nombre de un tercero, procura
              contar con su autorización para hacerlo.
            </p>
            <p className={paragraph}>
              El sitio puede registrar información técnica de navegación, como dirección IP,
              tipo de dispositivo, navegador e interacciones, a través de las herramientas
              utilizadas para seguridad y análisis del funcionamiento web. Nuestros formularios
              generales no están destinados a recoger datos sensibles.
            </p>
          </section>

          <section aria-labelledby="privacidad-finalidades">
            <h2 id="privacidad-finalidades" className={heading}>4. Finalidades del tratamiento</h2>
            <p className={paragraph}>
              Utilizamos los datos para responder preguntas y solicitudes de contacto;
              suministrar información, propuestas y cotizaciones; gestionar el seguimiento
              comercial relacionado con nuestros servicios y el proyecto TERRA; identificar
              el formulario desde el que recibimos una solicitud; verificar el uso legítimo
              de nuestros canales; cumplir obligaciones legales o contractuales cuando
              correspondan; y analizar el desempeño y la seguridad del sitio.
            </p>
            <p className={paragraph}>
              El envío de comunicaciones comerciales adicionales se realizará dentro de las
              finalidades informadas y autorizadas por el titular, cuando dicha autorización
              sea exigible. No utilizaremos los datos para fines incompatibles con los
              comunicados al momento de su recolección.
            </p>
          </section>

          <section aria-labelledby="privacidad-autorizacion">
            <h2 id="privacidad-autorizacion" className={heading}>5. Autorización y tratamiento</h2>
            <p className={paragraph}>
              Cuando la ley lo requiera, solicitaremos una autorización previa, expresa e
              informada antes de tratar los datos. El titular puede decidir si proporciona
              información opcional. La autorización podrá acreditarse por los medios
              admitidos legalmente, incluido el registro del formulario correspondiente.
              Conservaremos copia o registro de la autorización otorgada por el titular como
              prueba del tratamiento autorizado. El tratamiento sin autorización solo tendrá
              lugar en los casos permitidos por la legislación aplicable.
            </p>
          </section>

          <section aria-labelledby="privacidad-terceros">
            <h2 id="privacidad-terceros" className={heading}>6. Proveedores tecnológicos y navegación</h2>
            <p className={paragraph}>
              Nuestro sitio utiliza Web3Forms para recibir solicitudes web y hCaptcha para
              ayudar a prevenir envíos automatizados. También incorpora herramientas de
              analítica, como Google Analytics y Microsoft Clarity, que pueden utilizar
              identificadores o tecnologías similares para comprender la navegación y
              mejorar el sitio. Puedes gestionar las cookies desde la configuración de tu
              navegador, aunque algunas funciones pueden verse afectadas.
            </p>
            <p className={paragraph}>
              Cuando terceros presten servicios tecnológicos que impliquen acceso o tratamiento
              de datos personales, dicho tratamiento se sujetará a las obligaciones legales
              y de confidencialidad aplicables, mediante los contratos de transmisión de datos
              personales que correspondan. Estos servicios pueden procesar información mediante
              infraestructura ubicada fuera de Colombia; cuando ello implique una transferencia
              internacional de datos a terceros países, esta se realizará observando las
              condiciones y garantías que exige la Ley 1581 de 2012 y sus normas reglamentarias.
              Los enlaces a WhatsApp remiten a una plataforma externa que dispone de sus
              propias condiciones y políticas de privacidad.
            </p>
          </section>

          <section aria-labelledby="privacidad-derechos">
            <h2 id="privacidad-derechos" className={heading}>7. Derechos de los titulares</h2>
            <p className={paragraph}>
              Puedes conocer, acceder, actualizar y rectificar tus datos personales;
              solicitar información sobre el uso que se les ha dado; pedir prueba de la
              autorización cuando corresponda; solicitar su supresión o revocar la
              autorización en los casos legalmente procedentes; y presentar quejas ante
              la Superintendencia de Industria y Comercio, una vez agotado el trámite
              correspondiente ante el responsable, según la normativa aplicable.
            </p>
          </section>

          <section aria-labelledby="privacidad-solicitudes">
            <h2 id="privacidad-solicitudes" className={heading}>8. Consultas y reclamos</h2>
            <p className={paragraph}>
              Para ejercer tus derechos, envía una solicitud a gerencia@terraformings.co o
              mercadeo@terraformings.co con tu nombre, un medio de respuesta, la descripción
              de lo que solicitas y la información necesaria para verificar tu identidad o
              representación. No envíes contraseñas ni información sensible innecesaria.
            </p>
            <p className={paragraph}>
              Las consultas se atenderán, por regla general, dentro de los diez (10) días
              hábiles siguientes a su recepción. Cuando no fuere posible atender la consulta
              dentro de dicho término, se informará al interesado los motivos de la demora y
              la fecha en que se atenderá su consulta, la cual en ningún caso superará los
              cinco (5) días hábiles siguientes al vencimiento del primer plazo.
            </p>
            <p className={paragraph}>
              Los reclamos se tramitarán en un plazo de quince (15) días hábiles contados a
              partir del día siguiente a la fecha de su recibo. Cuando no fuere posible atender
              el reclamo dentro de dicho término, se informará al interesado los motivos de
              la demora y la fecha en que se atenderá su reclamo, la cual en ningún caso
              superará los ocho (8) días hábiles siguientes al vencimiento del primer plazo.
              Si el reclamo resulta incompleto, se requerirá al interesado dentro de los cinco
              (5) días siguientes a su recepción para que subsane las fallas; transcurridos
              dos (2) meses desde la fecha del requerimiento sin que presente la información
              solicitada, se entenderá que ha desistido del reclamo. También aplicarán los
              demás procedimientos de subsanación establecidos por la ley.
            </p>
          </section>

          <section aria-labelledby="privacidad-seguridad">
            <h2 id="privacidad-seguridad" className={heading}>9. Seguridad y conservación</h2>
            <p className={paragraph}>
              TERRA FORMING S.A.S. procurará adoptar medidas administrativas, técnicas y
              organizativas acordes con la naturaleza de los datos para prevenir el acceso,
              uso, divulgación, modificación o pérdida no autorizados. La información se
              conservará durante el tiempo necesario para cumplir las finalidades informadas
              y las obligaciones legales o contractuales aplicables. Cumplidas dichas
              condiciones, se procederá a su eliminación o anonimización cuando sea procedente.
            </p>
          </section>

          <section aria-labelledby="privacidad-base-de-datos">
            <h2 id="privacidad-base-de-datos" className={heading}>10. Vigencia de la base de datos</h2>
            <p className={paragraph}>
              El período de vigencia de la base de datos corresponde al tiempo durante el cual
              resulte necesario tratar los datos para cumplir las finalidades informadas en
              esta política y las obligaciones legales o contractuales aplicables: mientras
              se mantenga la relación comercial o el interés del titular y hasta por 10 años
              adicionales para el cumplimiento de obligaciones legales.
            </p>
          </section>

          <section aria-labelledby="privacidad-menores">
            <h2 id="privacidad-menores" className={heading}>11. Datos de menores de edad</h2>
            <p className={paragraph}>
              Nuestros formularios comerciales no están dirigidos a niños, niñas o adolescentes.
              Si excepcionalmente fuera necesario tratar sus datos personales, se observará
              el interés superior del menor, el respeto de sus derechos fundamentales y
              las autorizaciones o requisitos que exija la normativa colombiana.
            </p>
          </section>

          <section aria-labelledby="privacidad-vigencia">
            <h2 id="privacidad-vigencia" className={heading}>12. Vigencia y modificaciones</h2>
            <p className={paragraph}>
              Esta política se publica el 20 de octubre de 2026 y entra en vigencia a partir
              de esa fecha. Podrá actualizarse cuando cambien nuestras prácticas de tratamiento
              o las disposiciones aplicables. Las modificaciones sustanciales se comunicarán
              oportunamente a los titulares antes de su implementación, mediante este sitio
              web y, cuando corresponda, por los demás medios que exija la ley.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
