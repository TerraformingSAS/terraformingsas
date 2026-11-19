import { Web3FormsCaptcha } from "@/components/Web3FormsCaptcha";
import { cuotaPublica } from "@/components/terra/landing/cuota-publica";
import { TERRA_SIMULATOR_EVENT } from "@/components/terra/landing/links";
import { trackTerraEvent } from "@/lib/terra/analytics";
import { persistFinancingPlan, readSelectedLot } from "@/lib/terra/campaign";
import { TERRA_FINANCING, TERRA_LOT_TYPES, TERRA_PROJECT, formatCop } from "@/lib/terra/commercial";
import { terraWhatsAppUrl } from "@/lib/terra/contact";
import { milesInputValue, parseMiles } from "@/lib/terra/miles";
import { isQuoteBlocked, quoteStatusNote } from "@/lib/terra/quote-status";
import { fetchPublicLots, findPublicLot, normalizeLotId, type PublicLot } from "@/lib/terra/lots";
import { sendWeb3Forms } from "@/lib/web3forms";
import { useEffect, useMemo, useState } from "react";

const MIN_MONTHS = 1;
const MAX_MONTHS = 36;
const inputClass =
  "mt-1.5 w-full rounded-xl border border-brand-navy/15 bg-white px-3 py-3 text-base font-medium outline-none focus:border-brand-orange";

function clampSeparation(value: number, price: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(price, Math.max(0, Math.round(value)));
}

export function PublicSimulator() {
  const [open, setOpen] = useState(false);
  const [typeIndex, setTypeIndex] = useState(0);
  const [months, setMonths] = useState(12);
  const [separacion, setSeparacion] = useState(TERRA_FINANCING.separacionCop);
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [consent, setConsent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [lots, setLots] = useState<PublicLot[]>([]);
  const [lotId, setLotId] = useState("");

  const price = TERRA_LOT_TYPES[typeIndex].fromCop;
  const separation = clampSeparation(separacion, price);
  const percent = price > 0 ? (separation / price) * 100 : 0;
  const selectedLot = findPublicLot(lots, lotId);
  const blocked = selectedLot ? isQuoteBlocked(selectedLot.estado) : false;
  const statusNote = selectedLot ? quoteStatusNote(selectedLot.estado) : "";

  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      trackTerraEvent("view_quote", { location: "simulador" });
    };
    window.addEventListener(TERRA_SIMULATOR_EVENT, onOpen);
    return () => window.removeEventListener(TERRA_SIMULATOR_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetchPublicLots(controller.signal)
      .then((payload) => {
        setLots(payload.lotes);
        const stored = normalizeLotId(readSelectedLot(window.sessionStorage));
        if (stored) setLotId((current) => current || stored);
      })
      .catch(() => setLots([]));
    return () => controller.abort();
  }, [open]);

  const quote = useMemo(() => {
    const saldo = Math.round(price - separation);
    const financiado = Math.round(saldo * (TERRA_FINANCING.financedPercent / 100));
    const contraEntrega = saldo - financiado;
    return {
      saldo,
      financiado,
      contraEntrega,
      cuota: cuotaPublica(financiado, months),
    };
  }, [price, separation, months]);

  function setMonthsFrom(raw: number) {
    if (!Number.isFinite(raw)) return;
    setMonths(Math.min(MAX_MONTHS, Math.max(MIN_MONTHS, Math.round(raw))));
  }

  function setPercent(raw: number) {
    if (!Number.isFinite(raw)) return;
    const pct = Math.min(100, Math.max(0, raw));
    setSeparacion(Math.round((price * pct) / 100));
  }

  const type = TERRA_LOT_TYPES[typeIndex];
  const simulationLines = [
    "Hola TERRA, quiero cotizar esta simulación de la Etapa I:",
    `Nombre: ${nombre.trim()}`,
    `WhatsApp: ${whatsapp.trim()}`,
    selectedLot ? `Lote: ${selectedLot.id} (${selectedLot.estado})` : `Tipología: ${type.label}`,
    `Valor del lote: ${formatCop(price)}`,
    `Separación: ${percent.toLocaleString("es-CO", { maximumFractionDigits: 2 })}% (${formatCop(separation)})`,
    `Saldo a financiar (${TERRA_FINANCING.financedPercent}%): ${formatCop(quote.financiado)}`,
    `A la entrega (${TERRA_FINANCING.deliveryPercent}%): ${formatCop(quote.contraEntrega)}`,
    `Plazo: ${months} meses`,
    `Cuota estimada: ${formatCop(quote.cuota)}`,
  ];

  async function handleQuote() {
    const name = nombre.trim();
    const phone = whatsapp.trim();
    if (!name || name.length < 2) {
      setFeedback("Escribe tu nombre.");
      return;
    }
    if (!/^[+]?[0-9 ()-]{7,20}$/.test(phone)) {
      setFeedback("Escribe un número de WhatsApp válido.");
      return;
    }
    if (!consent) {
      setFeedback("Debes autorizar el tratamiento de tus datos para cotizar.");
      return;
    }
    if (!captchaToken) {
      setFeedback("Completa la verificación de seguridad.");
      return;
    }
    if (blocked) {
      setFeedback("Este lote está vendido o no disponible y no admite cotización.");
      return;
    }

    setSending(true);
    setFeedback("");
    persistFinancingPlan(`${months}_meses`, window.sessionStorage);
    const data = new FormData();
    data.set("subject", "TERRA | Simulación de cuota");
    data.set("from_name", "Simulador público TERRA");
    data.set("origen", "Simulador TERRA");
    data.set("nombre", name);
    data.set("whatsapp", phone);
    data.set("email", "No informado");
    data.set("lote_interes", selectedLot?.id || type.label);
    data.set("estado_lote", selectedLot?.estado || "Tipología publicada");
    data.set("valor_lote", String(price));
    data.set("separacion", String(separation));
    data.set("plazo_meses", String(months));
    data.set("cuota_estimada", String(quote.cuota));
    data.set("plan_financiacion", `${months}_meses`);
    data.set("simulacion", simulationLines.join("\n"));
    data.set("pagina_origen", "/terra");
    data.set(
      "autorizacion_tratamiento_datos",
      "Sí, autorización expresa desde el simulador público",
    );

    try {
      await sendWeb3Forms(data, captchaToken);
      trackTerraEvent("generate_lead", {
        location: "simulador_cotizar",
        plan: `${months}_meses`,
        lot_id: selectedLot?.id || "tipologia",
        value: quote.cuota,
        method: "simulator",
      });
      trackTerraEvent("whatsapp_click", { location: "simulador_cotizar" });
      window.open(
        `https://wa.me/${TERRA_PROJECT.phoneE164}?text=${encodeURIComponent(simulationLines.join("\n"))}`,
        "_blank",
        "noopener,noreferrer",
      );
      setFeedback("Enviamos tu simulación. WhatsApp se abre con el mismo detalle.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo enviar la cotización.");
    } finally {
      setSending(false);
      setCaptchaToken("");
      setCaptchaResetKey((value) => value + 1);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-4 z-40 inline-flex min-h-12 items-center rounded-full bg-brand-navy px-5 text-sm font-semibold text-white shadow-xl transition hover:-translate-y-0.5"
      >
        Simula tu cuota
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-end sm:justify-start sm:p-6">
          <button
            type="button"
            aria-label="Cerrar simulador"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <section
            role="dialog"
            aria-labelledby="simulador-titulo"
            className="relative max-h-[92vh] w-full max-w-[400px] overflow-y-auto rounded-3xl bg-white text-brand-navy shadow-2xl"
          >
            <header className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-brand-navy px-5 py-4 text-white">
              <h2 id="simulador-titulo" className="font-display text-2xl font-bold">
                Simulador
              </h2>
              <a
                href={terraWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackTerraEvent("whatsapp_click", { location: "simulador" })}
                className="ml-auto rounded-full bg-white px-3 py-2 text-xs font-semibold text-brand-navy"
              >
                Hablar con un asesor
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar simulador"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-white transition hover:bg-white/15"
              >
                ×
              </button>
            </header>

            <div className="space-y-4 px-5 py-5">
              <label className="block text-sm">
                <span className="text-brand-dark/70">Nombre *</span>
                <input
                  type="text"
                  autoComplete="name"
                  data-clarity-mask="true"
                  required
                  minLength={2}
                  maxLength={80}
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm">
                <span className="text-brand-dark/70">Número de WhatsApp *</span>
                <input
                  type="tel"
                  autoComplete="tel"
                  data-clarity-mask="true"
                  required
                  minLength={7}
                  maxLength={20}
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="block text-sm">
                <span className="text-brand-dark/70">Lote (opcional)</span>
                <input
                  type="text"
                  list="terra-lotes-simulador"
                  placeholder="Ej. C-12"
                  value={lotId}
                  onChange={(event) => setLotId(normalizeLotId(event.target.value))}
                  className={inputClass}
                />
                <datalist id="terra-lotes-simulador">
                  {lots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.estado}
                    </option>
                  ))}
                </datalist>
              </label>
              {selectedLot && blocked ? (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-800" role="alert">
                  El lote {selectedLot.id} está {selectedLot.estado.toLowerCase()} y no admite
                  cotización.
                </p>
              ) : null}
              {statusNote ? (
                <p
                  className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900"
                  role="status"
                >
                  {statusNote}
                </p>
              ) : null}

              <label className="block text-sm">
                <span className="text-brand-dark/70">Valor del lote</span>
                <select
                  value={typeIndex}
                  onChange={(event) => setTypeIndex(Number(event.target.value))}
                  className={inputClass}
                >
                  {TERRA_LOT_TYPES.map((item, index) => (
                    <option key={item.label} value={index}>
                      {item.label} · {formatCop(item.fromCop)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-[104px_1fr] gap-2">
                <label className="block text-sm">
                  <span className="text-brand-dark/70">Separación</span>
                  <span className="mt-1.5 flex items-center rounded-xl border border-brand-navy/15 px-3 py-3 focus-within:border-brand-orange">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={Number(percent.toFixed(2))}
                      aria-label="Porcentaje de separación"
                      onChange={(event) => setPercent(Number(event.target.value))}
                      className="w-full bg-transparent font-semibold outline-none"
                    />
                    <span className="text-brand-dark/50">%</span>
                  </span>
                </label>
                <label className="block text-sm">
                  <span className="text-brand-dark/70">Valor</span>
                  <span className="mt-1.5 flex items-center gap-2 rounded-xl border border-brand-navy/15 px-3 py-3 focus-within:border-brand-orange">
                    <input
                      inputMode="numeric"
                      value={milesInputValue(String(separation))}
                      aria-label="Valor de la separación"
                      onChange={(event) => {
                        const parsed = parseMiles(event.target.value);
                        setSeparacion(clampSeparation(parsed === "" ? 0 : parsed, price));
                      }}
                      className="w-full bg-transparent font-semibold outline-none"
                    />
                    <span className="text-xs font-medium text-brand-dark/45">COP</span>
                  </span>
                </label>
              </div>

              <div>
                <p className="text-sm text-brand-dark/70">
                  Saldo a financiar ({TERRA_FINANCING.financedPercent}%)
                </p>
                <p className="mt-1.5 rounded-xl border border-brand-navy/15 bg-brand-cream px-3 py-3 font-semibold">
                  {formatCop(quote.financiado)}{" "}
                  <span className="font-medium text-brand-dark/45">COP</span>
                </p>
                <p className="mt-1 text-xs text-brand-dark/60">
                  {TERRA_FINANCING.deliveryPercent}% a la entrega: {formatCop(quote.contraEntrega)}
                </p>
              </div>

              <div>
                <div className="flex items-end justify-between gap-3">
                  <p className="text-sm text-brand-dark/70">¿A cuánto tiempo?</p>
                  <label className="flex items-center gap-2 font-display text-3xl font-bold text-brand-orange">
                    <input
                      type="number"
                      min={MIN_MONTHS}
                      max={MAX_MONTHS}
                      value={months}
                      aria-label="Meses de financiación"
                      onChange={(event) => setMonthsFrom(Number(event.target.value))}
                      className="w-20 bg-transparent text-right outline-none"
                    />
                    <span className="text-base font-semibold text-brand-navy">meses</span>
                  </label>
                </div>
                <input
                  type="range"
                  min={MIN_MONTHS}
                  max={MAX_MONTHS}
                  step={1}
                  value={months}
                  aria-label="Plazo en meses"
                  onChange={(event) => setMonthsFrom(Number(event.target.value))}
                  className="mt-3 w-full accent-brand-orange"
                />
                <div className="flex justify-between text-xs text-brand-dark/50">
                  <span>{MIN_MONTHS}</span>
                  <span>Desliza o escribe el plazo</span>
                  <span>{MAX_MONTHS}</span>
                </div>
              </div>

              <p className="rounded-2xl bg-brand-cream px-4 py-3 text-center">
                <span className="block text-xs uppercase tracking-[0.14em] text-brand-dark/60">
                  Cuota estimada
                </span>
                <span className="font-display text-3xl font-bold text-brand-navy">
                  {formatCop(quote.cuota)}
                </span>
              </p>

              <label className="flex items-start gap-2.5 text-xs leading-relaxed text-brand-dark/80">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-brand-green"
                  required
                />
                <span>
                  Autorizo a TERRA FORMING S.A.S. a tratar mis datos para atender esta cotización. *
                </span>
              </label>
              <Web3FormsCaptcha onTokenChange={setCaptchaToken} resetKey={captchaResetKey} />

              <button
                type="button"
                onClick={() => void handleQuote()}
                disabled={sending || blocked}
                className="inline-flex w-full items-center justify-center rounded-full bg-[#25D366] py-3.5 text-base font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? "Enviando..." : "Cotizar"}
              </button>
              <p className="text-center text-[11px] leading-relaxed text-brand-dark/60">
                Es una simulación y no reemplaza la cotización de un asesor.
              </p>
              <p
                role="status"
                aria-live="polite"
                className={`text-center text-sm ${feedback.includes("Enviamos") ? "text-green-800" : feedback ? "text-red-700" : ""}`}
              >
                {feedback}
              </p>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
