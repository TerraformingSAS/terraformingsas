import { useState } from "react";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

const PROJECT_TYPES = [
  "Infraestructura vial",
  "Acueducto o alcantarillado",
  "Urbanismo",
  "Vivienda o desarrollo urbano",
  "Movimiento de tierras",
  "Alumbrado público",
  "Otro",
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  type: string;
  message: string;
};

const initial: FormState = { name: "", email: "", phone: "", company: "", type: "", message: "" };

export function Contact() {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
    if (status !== "idle") {
      setStatus("idle");
      setResult("");
    }
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Ingrese su nombre";
    if (!form.email.trim()) e.email = "Ingrese un correo";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Correo no válido";
    if (!form.phone.trim()) e.phone = "Ingrese un teléfono";
    if (!form.type) e.type = "Seleccione tipo de proyecto";
    if (!form.message.trim() || form.message.trim().length < 10)
      e.message = "Cuéntenos un poco más (mínimo 10 caracteres)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (!validate()) {
      setStatus("idle");
      setResult("");
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");
    setResult("Enviando...");

    const formData = new FormData(ev.currentTarget);
    formData.append("access_key", "bbf249ee-fab7-45d0-9bee-0c0cf71f3af4");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        setStatus("success");
        setResult("Formulario enviado correctamente");
        setForm(initial);
        setErrors({});
      } else {
        setStatus("error");
        setResult(data?.message || "No se pudo enviar el formulario. Intente nuevamente.");
      }
    } catch {
      setStatus("error");
      setResult("Error de conexión. Verifique su red e intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="py-24 sm:py-32 bg-white">
      <div className="container-tf grid gap-12 lg:grid-cols-2">
        <Reveal>
          <SectionHeader
            eyebrow="Contacto"
            title="Hablemos de su proyecto"
            intro="Complete el formulario y nuestro equipo se pondrá en contacto para conocer los detalles de su iniciativa."
          />

          <div className="mt-10 space-y-6">
            <InfoRow
              label="Ubicación"
              value="Cali, Valle del Cauca, Colombia"
              icon={<path d="M12 22s7-7 7-13a7 7 0 10-14 0c0 6 7 13 7 13z M12 11a2 2 0 100-4 2 2 0 000 4z" />}
            />
            <InfoRow
              label="Correo"
              value={<a href="mailto:gerencia@terraformings.co" className="hover:text-brand-orange">gerencia@terraformings.co</a>}
              icon={<path d="M4 6h16v12H4z M4 6l8 7 8-7" />}
            />
            <InfoRow
              label="Teléfono"
              value={<a href="tel:+573112363149" className="hover:text-brand-orange">311 236 3149</a>}
              icon={<path d="M5 4h4l2 5-3 2a12 12 0 006 6l2-3 5 2v4a2 2 0 01-2 2A17 17 0 013 6a2 2 0 012-2z" />}
            />
          </div>
        </Reveal>

        <Reveal delay={100}>
          <form
            onSubmit={onSubmit}
            className="rounded-2xl bg-brand-gray p-6 sm:p-8 border border-border"
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre completo *" error={errors.name}>
                <input
                  name="name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={inputCls(!!errors.name)}
                  autoComplete="name"
                  maxLength={80}
                />
              </Field>
              <Field label="Empresa / Entidad">
                <input
                  name="company"
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  className={inputCls(false)}
                  maxLength={80}
                />
              </Field>
              <Field label="Correo *" error={errors.email}>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputCls(!!errors.email)}
                  autoComplete="email"
                  maxLength={120}
                />
              </Field>
              <Field label="Teléfono *" error={errors.phone}>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inputCls(!!errors.phone)}
                  autoComplete="tel"
                  maxLength={30}
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Tipo de proyecto *" error={errors.type}>
                <select
                  name="type"
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                  className={inputCls(!!errors.type)}
                >
                  <option value="">Seleccione una opción</option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Cuéntenos sobre su proyecto *" error={errors.message}>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  rows={5}
                  className={inputCls(!!errors.message)}
                  maxLength={1000}
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-md bg-brand-orange px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110"
            >
              {isSubmitting ? "Enviando..." : "Enviar solicitud"}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {status === "success" && (
              <div role="status" className="mt-4 rounded-md border border-brand-green/40 bg-brand-green/10 p-4 text-sm text-brand-navy">
                {result || "Gracias, hemos recibido su solicitud. Nuestro equipo le contactará pronto."}
              </div>
            )}

            {status === "error" && (
              <div role="status" className="mt-4 rounded-md border border-red-500/40 bg-red-50 p-4 text-sm text-red-700">
                {result || "No se pudo enviar el formulario."}
              </div>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function inputCls(err: boolean) {
  return `w-full rounded-md border bg-white px-4 py-3 text-sm text-brand-navy outline-none transition-colors placeholder:text-brand-dark/40 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 ${
    err ? "border-red-500" : "border-border"
  }`;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold tracking-wide text-brand-navy">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-white">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-brand-green">{label}</div>
        <div className="mt-1 text-base text-brand-navy font-medium break-words">{value}</div>
      </div>
    </div>
  );
}