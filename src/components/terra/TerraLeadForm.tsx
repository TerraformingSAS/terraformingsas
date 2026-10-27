import { useState, type FormEvent } from "react";
import { Web3FormsCaptcha } from "@/components/Web3FormsCaptcha";
import { sendWeb3Forms } from "@/lib/web3forms";

type Lead = {
  nombre: string;
  whatsapp: string;
  correo: string;
  tipo_documento: string;
  numero_documento: string;
  referido_por: string;
};

const initial: Lead = {
  nombre: "",
  whatsapp: "",
  correo: "",
  tipo_documento: "",
  numero_documento: "",
  referido_por: "",
};

const baseInput =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-brand-navy outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20";

export function TerraLeadForm() {
  const [values, setValues] = useState<Lead>(initial);
  const [consent, setConsent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [sent, setSent] = useState(false);

  const set = (key: keyof Lead, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setFeedback("");
    setSent(false);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const nombre = values.nombre.trim();
    const whatsapp = values.whatsapp.trim();
    const correo = values.correo.trim();
    const numero = values.numero_documento.trim();

    if (
      !nombre ||
      !/^[+]?[0-9 ()-]{7,20}$/.test(whatsapp) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) ||
      !["CC", "CE", "TI", "PA", "PPT", "OTRO"].includes(values.tipo_documento) ||
      !/^[a-zA-Z0-9-]{4,20}$/.test(numero)
    ) {
      setFeedback("Revisa los campos obligatorios y los datos ingresados.");
      return;
    }
    if (!consent) {
      setFeedback("Debes autorizar el tratamiento de tus datos personales para continuar.");
      return;
    }
    if (!captchaToken) {
      setFeedback("Completa la verificación de seguridad.");
      return;
    }

    setSending(true);
    setFeedback("");
    setSent(false);

    const data = new FormData();
    data.set("subject", "TERRA | Nuevo interesado en preventa");
    data.set("from_name", "Formulario de preventa TERRA");
    data.set("origen", "Preventa TERRA");
    data.set("nombre", nombre);
    data.set("whatsapp", whatsapp);
    data.set("email", correo);
    data.set("tipo_documento", values.tipo_documento);
    data.set("numero_documento", numero);
    data.set("referido_por", values.referido_por.trim() || "No informado");
    data.set("autorizacion_tratamiento_datos", "Sí, autorización expresa");
    data.set("texto_autorizacion", "Autorizo a TERRA FORMING S.A.S. a tratar mis datos personales para atender mi solicitud de información sobre TERRA y contactarme por los medios suministrados.");

    try {
      await sendWeb3Forms(data, captchaToken);
      setSent(true);
      setFeedback("Recibimos tus datos correctamente. Pronto nos pondremos en contacto.");
      setValues(initial);
      setConsent(false);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo enviar el formulario.");
    } finally {
      setSending(false);
      setCaptchaToken("");
      setCaptchaResetKey((value) => value + 1);
    }
  }

  return (
    <div id="preventa-terra" className="overflow-hidden rounded-[1.6rem] border border-white/60 bg-white text-brand-navy shadow-2xl">
      <div className="bg-brand-navy px-5 pb-4 pt-5 text-white sm:px-6">
        <span className="inline-flex rounded-full bg-brand-green px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
          Cupos limitados
        </span>
        <h2 className="mt-2.5 font-display text-xl font-extrabold leading-tight sm:text-2xl">
          Recibe tu cotización
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-white/90 sm:text-sm">
          Preventa hasta el <span className="font-semibold text-brand-orange">15 de noviembre</span>.
          Déjanos tus datos para asegurar tu descuento en esta etapa.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 px-4 py-4 sm:px-6 sm:py-5">
        <label className="sr-only" htmlFor="terra-nombre">Nombre completo</label>
        <input id="terra-nombre" name="nombre" type="text" autoComplete="name" className={baseInput}
          placeholder="Nombre completo *" aria-label="Nombre completo" value={values.nombre}
          onChange={(event) => set("nombre", event.target.value)} required minLength={2} maxLength={80} />
        <label className="sr-only" htmlFor="terra-whatsapp">WhatsApp</label>
        <input id="terra-whatsapp" name="whatsapp" type="tel" autoComplete="tel" className={baseInput}
          placeholder="WhatsApp *" aria-label="WhatsApp" value={values.whatsapp}
          onChange={(event) => set("whatsapp", event.target.value)} required minLength={7} maxLength={20} />
        <label className="sr-only" htmlFor="terra-correo">Correo electrónico</label>
        <input id="terra-correo" name="correo" type="email" autoComplete="email" className={baseInput}
          placeholder="Correo electrónico *" aria-label="Correo electrónico" value={values.correo}
          onChange={(event) => set("correo", event.target.value)} required maxLength={120} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <label className="sr-only" htmlFor="terra-tipo-documento">Tipo de documento</label>
            <select id="terra-tipo-documento" name="tipo_documento" value={values.tipo_documento}
              onChange={(event) => set("tipo_documento", event.target.value)}
              aria-label="Tipo de documento" className={baseInput} required>
              <option value="">Tipo de documento *</option>
              <option value="CC">Cédula de ciudadanía</option>
              <option value="CE">Cédula de extranjería</option>
              <option value="TI">Tarjeta de identidad</option>
              <option value="PA">Pasaporte</option>
              <option value="PPT">Permiso por Protección Temporal</option>
              <option value="OTRO">Otro documento</option>
            </select>
          </div>
          <div>
            <label className="sr-only" htmlFor="terra-documento">Número de documento</label>
            <input id="terra-documento" name="numero_documento" type="text" autoComplete="off"
              className={baseInput} placeholder="Número de documento *" aria-label="Número de documento"
              value={values.numero_documento} onChange={(event) => set("numero_documento", event.target.value)}
              required minLength={4} maxLength={20} pattern="[a-zA-Z0-9-]{4,20}" />
          </div>
        </div>
        <div>
          <label htmlFor="terra-referido-por" className="mb-1 block text-xs font-semibold text-brand-navy">
            ¿Quién te contó de nosotros? <span className="font-normal text-brand-dark/65">(opcional)</span>
          </label>
          <input id="terra-referido-por" name="referido_por" type="text" autoComplete="off"
            className={baseInput} placeholder="Nombre de quien te refirió"
            value={values.referido_por} onChange={(event) => set("referido_por", event.target.value)}
            maxLength={100} />
        </div>
        <label className="flex items-start gap-2.5 py-1 text-xs leading-relaxed text-brand-dark">
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-brand-green" required />
          <span>
            Autorizo a TERRA FORMING S.A.S. a tratar mis datos personales para atender mi solicitud
            de información sobre TERRA y contactarme por los medios suministrados. *
          </span>
        </label>
        <Web3FormsCaptcha onTokenChange={setCaptchaToken} resetKey={captchaResetKey} />
        <button type="submit" disabled={sending || !consent || !captchaToken}
          className="w-full rounded-xl bg-brand-orange px-5 py-3 text-sm font-bold uppercase text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
          {sending ? "Enviando..." : "Quiero mi descuento →"}
        </button>
        <p role="status" aria-live="polite" className={"text-center text-sm " + (sent ? "text-green-800" : "text-red-700")}>
          {feedback}
        </p>
        <p className="rounded-xl bg-green-50 px-3 py-2 text-center text-xs text-green-800">
          Tus datos se usarán para responder tu solicitud.
        </p>
      </form>
    </div>
  );
}
