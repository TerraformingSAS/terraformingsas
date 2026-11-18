import { openPublicSimulator, rememberLot } from "@/components/terra/landing/links";
import { trackTerraEvent } from "@/lib/terra/analytics";
import { TERRA_LOT_TYPES, TERRA_PROJECT, formatCop } from "@/lib/terra/commercial";
import { terraWhatsAppUrl } from "@/lib/terra/contact";
import {
  fetchPublicLots,
  formatArea,
  isAvailableLot,
  lotExplorerUrl,
  summarizeLots,
  type PublicLot,
} from "@/lib/terra/lots";
import { useEffect, useMemo, useState } from "react";

export function LandingLots() {
  const [lots, setLots] = useState<PublicLot[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchPublicLots(controller.signal)
      .then((payload) => setLots(payload.lotes))
      .catch(() => setFailed(true));
    return () => controller.abort();
  }, []);

  const summary = useMemo(() => (lots ? summarizeLots(lots) : null), [lots]);
  const available = useMemo(
    () => (lots ? lots.filter((lot) => isAvailableLot(lot.estado)).slice(0, 8) : []),
    [lots],
  );
  const active = available.find((lot) => lot.id === picked) ?? available[0];

  return (
    <section id="lotes" className="scroll-mt-24 bg-[#f6f3ee] py-16 sm:py-24">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
              Inventario
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-brand-navy sm:text-5xl">
              Explora lotes con precio de referencia.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-brand-dark/75 sm:text-base">
              Las tipologías publicadas orientan la decisión. La disponibilidad sale de la fuente
              vigente del proyecto.
            </p>
          </div>
          {summary ? (
            <p className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-navy shadow-sm">
              {summary.disponibles} disponibles de {summary.total}
            </p>
          ) : null}
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {TERRA_LOT_TYPES.map((type) => (
            <li key={type.label}>
              <a
                href={TERRA_PROJECT.explorerPath}
                onClick={() =>
                  trackTerraEvent("explore_lots", { location: "tipologia", area: type.area })
                }
                className="group flex h-full flex-col justify-between rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="text-sm text-brand-dark/70">{type.label}</p>
                <p className="mt-6 font-display text-2xl font-bold text-brand-navy">
                  {formatCop(type.fromCop)}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-orange">
                  Desde
                </p>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-xl font-bold text-brand-navy">
                Lotes disponibles ahora
              </h3>
              <a
                href={TERRA_PROJECT.explorerPath}
                className="text-sm font-semibold text-brand-orange hover:underline"
              >
                Ver plano
              </a>
            </div>
            {failed ? (
              <p className="mt-6 text-sm text-brand-dark/75">
                No pudimos consultar la disponibilidad en este momento. El plano sigue disponible
                para revisar cada lote.
              </p>
            ) : !lots ? (
              <p className="mt-6 text-sm text-brand-dark/60">Consultando disponibilidad…</p>
            ) : available.length === 0 ? (
              <p className="mt-6 text-sm text-brand-dark/75">
                En este momento no hay lotes marcados como disponibles.
              </p>
            ) : (
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {available.map((lot) => {
                  const selected = active?.id === lot.id;
                  return (
                    <li key={lot.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setPicked(lot.id);
                          rememberLot(lot.id);
                          trackTerraEvent("select_lot", { lot_id: lot.id, location: "landing" });
                        }}
                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                          selected
                            ? "bg-brand-navy text-white"
                            : "bg-brand-cream text-brand-navy hover:bg-[#efe8dc]"
                        }`}
                      >
                        <span className="font-semibold">{lot.id}</span>
                        <span
                          className={`text-xs ${selected ? "text-white/75" : "text-brand-dark/60"}`}
                        >
                          {formatArea(lot.medidas?.area_m2)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <aside className="flex flex-col justify-between rounded-[28px] bg-brand-navy p-6 text-white sm:p-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-brand-orange">
                Siguiente paso
              </p>
              <h3 className="mt-3 font-display text-3xl font-bold">
                {active ? `Lote ${active.id}` : "Elige un lote"}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                {active
                  ? `${formatArea(active.medidas?.area_m2)} · manzana ${active.manzana}. La cuota exacta se calcula en el cotizador vigente.`
                  : "Selecciona un lote disponible o entra al plano para comparar manzanas."}
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  rememberLot(active?.id);
                  trackTerraEvent("view_quote", { location: "lotes", lot_id: active?.id });
                  openPublicSimulator();
                }}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-orange px-5 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Calcula tu cuota
              </button>
              <a
                href={active ? lotExplorerUrl(active.id) : TERRA_PROJECT.explorerPath}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-5 text-sm font-semibold transition hover:bg-white/10"
              >
                Ver en el plano
              </a>
              <a
                href={terraWhatsAppUrl(active?.id)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackTerraEvent("whatsapp_click", { location: "lotes", lot_id: active?.id })
                }
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#25D366] px-5 text-sm font-semibold transition hover:brightness-105"
              >
                WhatsApp de este lote
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
