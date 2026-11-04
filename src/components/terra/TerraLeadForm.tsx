import { Web3FormsCaptcha } from "@/components/Web3FormsCaptcha";
import { TerraPrimaryButton } from "@/components/terra/primitives";
import { sendWeb3Forms } from "@/lib/web3forms";
import { trackTerraEvent } from "@/lib/terra/analytics";
import {
  attributionFormFields,
  readAttribution,
  readFinancingPlan,
  readSelectedLot,
} from "@/lib/terra/campaign";
import { TERRA_COPY, TERRA_PROJECT } from "@/lib/terra/commercial";
import { normalizeLotId } from "@/lib/terra/lots";
import { useEffect, useState, type FormEvent } from "react";

type Lead = {
  nombre: string;
  whatsapp: string;
  correo: string;
  lote_interes: string;
  referido_por: string;
};

const initial: Lead = {
  nombre: "",
  whatsapp: "",
  correo: "",
  lote_interes: "",
  referido_por: "",
};

const baseInput =
  "w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-brand-navy outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20";

function lotFromLocation(): string {
  if (typeof window === "undefined") return "";
  const fromQuery = new URLSearchParams(window.location.search).get("lote");
  return normalizeLotId(fromQuery || readSelectedLot(window.sessionStorage));
}

export function TerraLeadForm({ compact = false }: { compact?: boolean }) {
  const [values, setValues] = useState<Lead>(initial);
  const [consent, setConsent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [sent, setSent] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const lote = lotFromLocation();
    if (lote) setValues((current) => ({ ...current, lote_interes: current.lote_interes || lote }));
  }, []);

  const set = (key: keyof Lead, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setFeedback("");
    setSent(false);
  };

  function markFormStart() {
    if (started) return;
    setStarted(true);
    trackTerraEvent("form_start", { page: "/terra" }, { onceKey: "terra-form-start" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const nombre = values.nombre.trim();
    const whatsapp = values.whatsapp.trim();
    const correo = values.correo.trim();
    const lote = normalizeLotId(values.lote_interes);

    if (!nombre || !/^[+]?[0-9 ()-]{7,20}$/.test(whatsapp)) {
      setFeedback("Revisa el nombre y el número de WhatsApp.");
      return;
    }
    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setFeedback("Revisa el correo electrónico o déjalo en blanco.");
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
    trackTerraEvent("request_quote", { lot_id: lote || "sin_lote", page: "/terra" });

    const attribution = readAttribution(window.sessionStorage);
    const campaign = attributionFormFields(attribution);
    const plan = readFinancingPlan(window.sessionStorage);
    const requestedAt = new Date().toLocaleString("sv-SE", { timeZone: "America/Bogota" });

    const data = new FormData();
    data.set("subject", "TERRA | Solicitud de cotización");
    data.set("from_name", "Formulario de cotización TERRA");
    data.set("origen", "Preventa TERRA");
    data.set("nombre", nombre);
    data.set("whatsapp", whatsapp);
    data.set("email", correo || "No informado");
    data.set("lote_interes", lote || "No informado");
    data.set("referido_por", values.referido_por.trim() || "No informado");
    data.set("autorizacion_tratamiento_datos", "Sí, autorización expresa");
    data.set(
      "texto_autorizacion",
      "Autorizo a TERRA FORMING S.A.S. a tratar mis datos personales para atender mi solicitud de información sobre TERRA y contactarme por los medios suministrados.",
    );
    data.set("pagina_origen", window.location.pathname);
    data.set("fecha_solicitud", requestedAt);
    data.set("plan_financiacion", plan || "No informado");
    data.set("lote_seleccionado", lote || "No informado");
    for (const [key, value] of Object.entries(campaign)) {
      if (value) data.set(key, value);
    }

    try {
      await sendWeb3Forms(data, captchaToken);
      setSent(true);
      setFeedback("Recibimos tus datos correctamente. Pronto nos pondremos en contacto.");
      trackTerraEvent(
        "generate_lead",
        { lot_id: lote || "sin_lote", page: "/terra", method: "form" },
        { onceKey: `lead-${requestedAt}` },
      );
      setValues({ ...initial, lote_interes: lote });
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
    <div
      id="preventa-terra"
      className="border border-brand-navy/10 bg-white text-brand-navy shadow-sm"
    >
      <div
        className={
          compact
            ? "bg-brand-navy px-4 py-3 text-white"
            : "bg-brand-navy px-5 py-5 text-white sm:px-6"
        }
      >
        <h2 className="font-display text-lg font-extrabold leading-tight sm:text-xl">
          {TERRA_COPY.formTitle}
        </h2>
        {compact ? null : (
          <p className="mt-2 text-sm leading-relaxed text-white/85">
            Cuéntanos cómo contactarte. Un asesor te comparte las condiciones vigentes del lote de
            interés.
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className={compact ? "space-y-2.5 px-4 py-4" : "space-y-3 px-4 py-5 sm:px-6"}
        onFocus={markFormStart}
      >
        <div>
          <label className="mb-1 block text-xs font-semibold" htmlFor="terra-nombre">
            Nombre *
          </label>
          <input
            id="terra-nombre"
            name="nombre"
            type="text"
            autoComplete="name"
            data-clarity-mask="true"
            className={baseInput}
            value={values.nombre}
            onChange={(event) => set("nombre", event.target.value)}
            required
            minLength={2}
            maxLength={80}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold" htmlFor="terra-whatsapp">
            Número de WhatsApp *
          </label>
          <input
            id="terra-whatsapp"
            name="whatsapp"
            type="tel"
            autoComplete="tel"
            data-clarity-mask="true"
            className={baseInput}
            value={values.whatsapp}
            onChange={(event) => set("whatsapp", event.target.value)}
            required
            minLength={7}
            maxLength={20}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold" htmlFor="terra-correo">
            Correo electrónico <span className="font-normal text-brand-dark/65">(opcional)</span>
          </label>
          <input
            id="terra-correo"
            name="correo"
            type="email"
            autoComplete="email"
            data-clarity-mask="true"
            className={baseInput}
            value={values.correo}
            onChange={(event) => set("correo", event.target.value)}
            maxLength={120}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold" htmlFor="terra-lote">
            Lote de interés <span className="font-normal text-brand-dark/65">(opcional)</span>
          </label>
          <input
            id="terra-lote"
            name="lote_interes"
            type="text"
            autoComplete="off"
            className={baseInput}
            placeholder="Ej. C-12"
            value={values.lote_interes}
            onChange={(event) => set("lote_interes", event.target.value)}
            maxLength={16}
          />
        </div>
        <div>
          <label
            htmlFor="terra-referido-por"
            className="mb-1 block text-xs font-semibold text-brand-navy"
          >
            ¿Cómo nos conociste? <span className="font-normal text-brand-dark/65">(opcional)</span>
          </label>
          <input
            id="terra-referido-por"
            name="referido_por"
            type="text"
            autoComplete="off"
            className={baseInput}
            placeholder="Instagram, un referido, visita al predio…"
            value={values.referido_por}
            onChange={(event) => set("referido_por", event.target.value)}
            maxLength={100}
          />
        </div>
        <label className="flex items-start gap-2.5 py-1 text-xs leading-relaxed text-brand-dark">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-brand-green"
            required
          />
          <span>
            Autorizo a TERRA FORMING S.A.S. a tratar mis datos personales para atender mi solicitud
            de información sobre TERRA y contactarme por los medios suministrados. *
          </span>
        </label>
        <Web3FormsCaptcha onTokenChange={setCaptchaToken} resetKey={captchaResetKey} />
        <TerraPrimaryButton type="submit" disabled={sending || !consent || !captchaToken}>
          {sending ? "Enviando..." : "Solicitar cotización"}
        </TerraPrimaryButton>
        <p className="text-center text-xs leading-relaxed text-brand-dark/70">
          Antes de separar o pedir información, lee la{" "}
          <a
            href={TERRA_PROJECT.legalPath}
            className="font-semibold text-brand-navy underline underline-offset-4 hover:text-brand-orange"
          >
            Información importante
          </a>
          .
        </p>
        <p
          role="status"
          aria-live="polite"
          className={
            "text-center text-sm " + (sent ? "text-green-800" : feedback ? "text-red-700" : "")
          }
        >
          {feedback}
        </p>
      </form>
    </div>
  );
}
