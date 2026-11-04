import { Reveal } from "@/components/Reveal";
import { TerraKicker, TerraPrimaryLink, TerraSecondaryLink } from "@/components/terra/primitives";
import { trackTerraEvent } from "@/lib/terra/analytics";
import { persistSelectedLot, readSelectedLot } from "@/lib/terra/campaign";
import { TERRA_COPY, TERRA_PROJECT } from "@/lib/terra/commercial";
import {
  fetchPublicLots,
  formatArea,
  isAvailableLot,
  lotExplorerUrl,
  lotQuoteUrl,
  summarizeLots,
  type PublicLot,
} from "@/lib/terra/lots";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

function pickPreviewLots(lotes: PublicLot[], preferredId: string): PublicLot[] {
  const preferred = lotes.find((lot) => lot.id === preferredId);
  const available = lotes.filter((lot) => isAvailableLot(lot.estado));
  const rest = available.filter((lot) => lot.id !== preferredId);
  const selected = preferred && isAvailableLot(preferred.estado) ? [preferred, ...rest] : rest;
  return selected.slice(0, 6);
}

export function LotPreview() {
  const query = useQuery({
    queryKey: ["terra-estado-public"],
    queryFn: ({ signal }) => fetchPublicLots(signal),
    staleTime: 60_000,
    retry: 1,
  });

  const [preferredId, setPreferredId] = useState("");
  useEffect(() => {
    setPreferredId(readSelectedLot(window.sessionStorage));
  }, []);
  const preview = useMemo(
    () => pickPreviewLots(query.data?.lotes ?? [], preferredId),
    [query.data, preferredId],
  );
  const summary = query.data ? summarizeLots(query.data.lotes) : null;

  return (
    <section id="lotes" className="scroll-mt-24 bg-brand-cream py-20 sm:py-28">
      <div className="container-tf">
        <Reveal>
          <div className="max-w-2xl">
            <TerraKicker>Lotes de la Etapa I</TerraKicker>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-brand-navy sm:text-4xl">
              {TERRA_COPY.lotsTitle}
            </h2>
            <p className="mt-4 text-brand-dark/80">
              Consulta manzana, área y disponibilidad con la misma fuente del plano interactivo. Los
              precios vigentes se confirman en la cotización.
            </p>
          </div>
        </Reveal>

        {summary ? (
          <p className="mt-6 text-sm text-brand-dark/70">
            {summary.disponibles} disponibles · {summary.separados} separados ·{" "}
            {summary.no_disponibles} no disponibles
          </p>
        ) : null}

        {query.isPending ? (
          <p className="mt-8 text-sm text-brand-dark/70" role="status">
            Consultando disponibilidad de lotes…
          </p>
        ) : null}

        {query.isError ? (
          <div
            className="mt-8 rounded-md border border-brand-navy/10 bg-white px-5 py-6"
            role="alert"
          >
            <p className="text-sm text-brand-dark/80">
              No pudimos cargar la disponibilidad en este momento. Entra al plano interactivo para
              consultarla, o vuelve a intentar en unos minutos.
            </p>
            <TerraPrimaryLink href={TERRA_PROJECT.explorerPath} className="mt-4">
              Explorar plano interactivo
            </TerraPrimaryLink>
          </div>
        ) : null}

        {query.isSuccess && preview.length === 0 ? (
          <p className="mt-8 text-sm text-brand-dark/70">
            No hay lotes disponibles para mostrar ahora. Puedes consultar el plano completo.
          </p>
        ) : null}

        {preview.length > 0 ? (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {preview.map((lot) => (
              <li key={lot.id}>
                <article className="flex h-full flex-col border border-brand-navy/10 bg-white p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-orange">
                    Manzana {lot.manzana}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold text-brand-navy">
                    Lote {lot.id}
                  </h3>
                  <dl className="mt-4 space-y-1 text-sm text-brand-dark/80">
                    <div className="flex justify-between gap-3">
                      <dt>Área</dt>
                      <dd className="font-medium text-brand-navy">
                        {formatArea(lot.medidas?.area_m2)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Estado</dt>
                      <dd className="font-medium text-brand-navy">{lot.estado}</dd>
                    </div>
                  </dl>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href={lotExplorerUrl(lot.id)}
                      className="text-sm font-semibold text-brand-navy underline-offset-4 hover:text-brand-orange hover:underline"
                      onClick={() => {
                        persistSelectedLot(lot.id, window.sessionStorage);
                        trackTerraEvent("select_lot", {
                          lot_id: lot.id,
                          manzana: lot.manzana,
                          status: lot.estado,
                          location: "landing_preview",
                        });
                      }}
                    >
                      Ver en el plano
                    </a>
                    {isAvailableLot(lot.estado) ? (
                      <a
                        href={lotQuoteUrl(lot.id)}
                        className="text-sm font-semibold text-brand-orange underline-offset-4 hover:underline"
                        onClick={() => {
                          persistSelectedLot(lot.id, window.sessionStorage);
                          trackTerraEvent("view_quote", {
                            lot_id: lot.id,
                            location: "landing_preview",
                          });
                        }}
                      >
                        Solicitar cotización
                      </a>
                    ) : (
                      <span className="text-sm text-brand-dark/55">
                        Consulta su estado, sin separación
                      </span>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <TerraPrimaryLink href={TERRA_PROJECT.explorerPath}>
            Explorar plano interactivo
          </TerraPrimaryLink>
          <TerraSecondaryLink href="#contacto" className="text-brand-navy">
            Solicitar información
          </TerraSecondaryLink>
        </div>
      </div>
    </section>
  );
}
