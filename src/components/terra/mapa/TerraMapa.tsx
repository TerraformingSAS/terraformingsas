import geometria from "@/lib/terra/mapa/geometria.json";
import { joinLots, type GeomLot } from "@/lib/terra/mapa/join";
import { terraWhatsAppUrl } from "@/lib/terra/contact";
import { fetchPublicLots, isAvailableLot } from "@/lib/terra/lots";
import { TerraHeader } from "@/components/terra/TerraHeader";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TerrainHandle, TerrainPayload } from "./terreno-scene";

const COLORS: Record<string, string> = {
  Disponible: "#66b48a",
  Reservado: "#ebcb6a",
  "En negociación": "#86b9da",
  Vendido: "#db8179",
  "No disponible": "#b4b9b4",
};

const ETAPA_I = new Set(["C", "D", "E", "F"]);
const GEOMETRY = (geometria as GeomLot[]).filter((lot) => ETAPA_I.has(lot.manzana));

const MAPA_SELECTION_CSS = `
.mapa-selection{position:absolute;z-index:20;bottom:18px;left:50%;transform:translateX(-50%);width:440px;max-width:calc(100% - 28px);background:#fff;box-shadow:0 8px 30px #0e2a4722;border:1px solid #cbd5e1;border-top:3px solid #f7941d;border-radius:9px;padding:14px 18px;color:#0e2a47;font:14px/1.6 Inter,system-ui,sans-serif;animation:mapa-selection-in .28s ease}
.mapa-selection-head{display:flex;align-items:center;gap:12px}
.mapa-selection-head>div{display:flex;align-items:center;gap:8px}
.mapa-selection-label{font-size:11px;color:#64748b}
.mapa-selection strong{font:700 19px Montserrat,sans-serif}
.mapa-estado{margin-left:auto;font-size:12px;border-left:1px solid #e2e8f0;padding-left:12px}
.mapa-selection button{flex-shrink:0;font-size:21px;color:#64748b;cursor:pointer;border:0;background:transparent;min-width:36px;min-height:36px}
.mapa-lot-sizes{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:12px 0 0;padding-top:12px;border-top:1px solid #e2e8f0}
.mapa-lot-sizes dt{font-size:10px;color:#64748b;margin-bottom:3px}
.mapa-lot-sizes dd{margin:0;font:600 18px Montserrat,sans-serif;letter-spacing:-.5px}
.mapa-size-note{font-size:10px;color:#64748b;margin:10px 0 0}
.mapa-selection-actions{display:flex;align-items:center;justify-content:flex-end;margin-top:12px;gap:8px;flex-wrap:wrap}
.mapa-quote-whatsapp{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:max-content;min-height:41px;padding:9px 17px 9px 13px;border:0;border-radius:999px;background:#128c58;color:#fff;text-decoration:none;font:700 12px/1.25 Inter,system-ui,sans-serif;box-shadow:0 4px 14px rgba(18,140,88,.20)}
.mapa-quote-whatsapp svg{display:block;flex:0 0 auto;width:21px;height:21px;fill:currentColor}
.mapa-quote-whatsapp[aria-disabled="true"]{background:#a7b3bd;color:#fff;opacity:.88;box-shadow:none;cursor:not-allowed;pointer-events:none}
@keyframes mapa-selection-in{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@media (min-width:1024px){
  .mapa-selection{top:16px;right:16px;left:auto;bottom:auto;transform:none;width:320px;max-height:calc(100% - 32px);overflow:auto}
  @keyframes mapa-selection-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
}
@media (max-width:1023px){
  .mapa-selection{left:8px;right:8px;bottom:8px;transform:none;width:auto;max-width:none;max-height:46%;overflow:auto}
  @keyframes mapa-selection-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
}
`;

function medida(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) return "Por confirmar";
  return value.toLocaleString("es-CO", { maximumFractionDigits: 2 });
}

export function TerraMapa() {
  const [commercial, setCommercial] = useState<Awaited<ReturnType<typeof fetchPublicLots>> | null>(
    null,
  );
  const [terrain, setTerrain] = useState<TerrainPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [terrainError, setTerrainError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [manzana, setManzana] = useState("");
  const [estado, setEstado] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<TerrainHandle | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchPublicLots(controller.signal)
      .then((data) => {
        setCommercial(data);
        const query = new URLSearchParams(window.location.search).get("lote");
        if (query) setSelectedId(query.toUpperCase());
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "No se pudo cargar la disponibilidad.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    fetch("/terra/mapa/terreno.json")
      .then((response) => {
        if (!response.ok) throw new Error("No se pudo cargar el terreno.");
        return response.json() as Promise<TerrainPayload>;
      })
      .then(setTerrain)
      .catch((reason: unknown) => {
        setTerrainError(reason instanceof Error ? reason.message : "No se pudo cargar el terreno.");
      });
    return () => controller.abort();
  }, []);

  const joined = useMemo(() => joinLots(GEOMETRY, commercial?.lotes ?? []), [commercial]);
  const manzanas = useMemo(() => [...new Set(GEOMETRY.map((lot) => lot.manzana))].sort(), []);
  const visible = useMemo(
    () =>
      joined.lots.filter((lot) => {
        if (manzana && lot.manzana !== manzana) return false;
        if (estado && lot.estado !== estado) return false;
        return true;
      }),
    [joined.lots, manzana, estado],
  );
  const visibleIds = useMemo(() => new Set(visible.map((lot) => lot.id)), [visible]);
  const selected = joined.lots.find((lot) => lot.id === selectedId) ?? null;
  const lotsRef = useRef(joined.lots);
  const visibleRef = useRef(visibleIds);
  const selectedRef = useRef(selectedId);
  lotsRef.current = joined.lots;
  visibleRef.current = visibleIds;
  selectedRef.current = selectedId;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !terrain) return;
    let cancelled = false;
    void import("./terreno-scene").then(async ({ mountTerrain }) => {
      if (cancelled) return;
      const handle = await mountTerrain(canvas, terrain, (id) => {
        setSelectedId(id);
        const url = new URL(window.location.href);
        url.searchParams.set("lote", id);
        window.history.replaceState(null, "", url);
      });
      if (cancelled) {
        handle.dispose();
        return;
      }
      handleRef.current = handle;
      handle.setLots(lotsRef.current, visibleRef.current);
      handle.setSelected(selectedRef.current);
    });
    return () => {
      cancelled = true;
      handleRef.current?.dispose();
      handleRef.current = null;
    };
    // The scene is created once per terrain payload. Later updates go through the handle.
  }, [terrain]);

  useEffect(() => {
    handleRef.current?.setLots(joined.lots, visibleIds);
    handleRef.current?.setSelected(selectedId);
  }, [joined.lots, visibleIds, selectedId]);

  const canQuote = selected ? isAvailableLot(selected.estado ?? "") : false;
  const medidas = selected?.medidas;

  return (
    <div className="min-h-screen bg-[#e7eef2] text-[#0e2a47]">
      <TerraHeader solid />
      <main id="contenido" className="flex min-h-screen flex-col pt-[68px] sm:pt-[72px]">
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 sm:px-4">
          <div className="mr-auto">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[#1d6f8a]">
              TERRA · ETAPA I
            </p>
            <h1 className="font-display text-lg font-semibold leading-tight sm:text-xl">
              Terreno del predio
            </h1>
          </div>
          <label className="text-sm">
            <span className="sr-only">Manzana</span>
            <select
              className="rounded-lg border border-[#d5dee6] bg-white px-2 py-1.5"
              value={manzana}
              onChange={(event) => setManzana(event.target.value)}
            >
              <option value="">Todas las manzanas</option>
              {manzanas.map((block) => (
                <option key={block} value={block}>
                  Manzana {block}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="sr-only">Estado</span>
            <select
              className="rounded-lg border border-[#d5dee6] bg-white px-2 py-1.5"
              value={estado}
              onChange={(event) => setEstado(event.target.value)}
            >
              <option value="">Todos los estados</option>
              {Object.keys(COLORS).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="relative mx-3 mb-3 min-h-[70vh] flex-1 overflow-hidden rounded-2xl bg-[#c5d5df] shadow-[0_8px_30px_rgba(14,42,71,0.12)] sm:mx-4">
          {loading && (
            <p className="absolute left-3 top-3 z-10 rounded-lg bg-white/90 px-3 py-2 text-sm shadow">
              Cargando disponibilidad…
            </p>
          )}
          {(error || terrainError) && (
            <p
              className="absolute left-3 top-3 z-10 max-w-sm rounded-lg bg-white px-3 py-2 text-sm shadow"
              role="alert"
            >
              {terrainError ?? error}
            </p>
          )}
          <canvas ref={canvasRef} className="h-full min-h-[70vh] w-full touch-none" />
          <style>{MAPA_SELECTION_CSS}</style>
          <div className="absolute bottom-3 left-3 flex flex-col gap-1">
            <button
              type="button"
              className="h-9 rounded-lg bg-white px-2 text-xs shadow"
              onClick={() => handleRef.current?.setView("3d")}
            >
              Vista 3D
            </button>
            <button
              type="button"
              className="h-9 rounded-lg bg-white px-2 text-xs shadow"
              onClick={() => handleRef.current?.setView("superior")}
            >
              Vista superior
            </button>
            <button
              type="button"
              className="h-9 rounded-lg bg-white px-2 text-xs shadow"
              onClick={() => handleRef.current?.reset()}
            >
              Ajustar
            </button>
          </div>
          {selected && (
            <div className="mapa-selection" role="dialog" aria-label={`Lote ${selected.id}`}>
              <div className="mapa-selection-head">
                <div>
                  <span className="mapa-selection-label">Lote</span>
                  <strong>{selected.id}</strong>
                </div>
                <span className="mapa-estado">{selected.estado ?? "Por confirmar"}</span>
                <button
                  type="button"
                  aria-label="Cerrar selección"
                  onClick={() => setSelectedId(null)}
                >
                  ×
                </button>
              </div>
              <dl className="mapa-lot-sizes">
                <div>
                  <dt>Manzana</dt>
                  <dd>{selected.manzana}</dd>
                </div>
                <div>
                  <dt>Dimensiones</dt>
                  <dd>
                    {medidas
                      ? `${medida(medidas.lado_a_m)} × ${medida(medidas.lado_b_m)} m`
                      : "Por confirmar"}
                  </dd>
                </div>
                <div>
                  <dt>Área del lote</dt>
                  <dd>{medidas ? `${medida(medidas.area_m2)} m²` : "Por confirmar"}</dd>
                </div>
              </dl>
              <p className="mapa-size-note">Medidas y área según el Excel.</p>
              <p className="mapa-size-note">
                Consulta las condiciones vigentes de separación y financiación en tu cotización.
              </p>
              <div className="mapa-selection-actions">
                <a
                  className="mapa-quote-whatsapp"
                  href={canQuote ? terraWhatsAppUrl(selected.id) : undefined}
                  aria-disabled={canQuote ? undefined : true}
                  tabIndex={canQuote ? 0 : -1}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={
                    canQuote
                      ? `Cotizar el lote ${selected.id} por WhatsApp`
                      : `El lote ${selected.id} no está disponible para cotizar`
                  }
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M20.52 3.48A11.94 11.94 0 0012.06 0C5.5 0 .17 5.33.17 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.65a11.9 11.9 0 005.76 1.47h.01c6.56 0 11.9-5.33 11.9-11.9 0-3.18-1.24-6.16-3.45-8.44zM12.07 21.7a9.8 9.8 0 01-5-1.37l-.36-.21-3.74.98 1-3.64-.24-.37a9.8 9.8 0 01-1.5-5.19c0-5.42 4.42-9.83 9.85-9.83 2.63 0 5.1 1.02 6.96 2.88a9.77 9.77 0 012.88 6.96c0 5.42-4.42 9.79-9.85 9.79zm5.4-7.34c-.29-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.29-.76.96-.94 1.15-.17.2-.35.22-.64.07-.29-.15-1.23-.45-2.34-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.35.44-.52.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.9-2.19-.24-.58-.48-.5-.66-.51h-.56c-.2 0-.52.07-.79.36-.27.29-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.56-.35z" />
                  </svg>
                  <span>Cotízame</span>
                </a>
              </div>
            </div>
          )}
          <ul className="absolute bottom-3 right-3 hidden max-w-[220px] flex-wrap gap-x-3 gap-y-1 rounded-xl bg-white/95 px-3 py-2 text-xs shadow sm:flex">
            {Object.entries(COLORS).map(([state, color]) => (
              <li key={state} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ background: color }}
                />
                {state}
              </li>
            ))}
          </ul>
        </div>

        <p className="px-4 pb-2 text-xs leading-relaxed text-[#3d5163]">
          El relieve y la foto del predio comparten el recorte del KML
          {terrain ? ` (${terrain.elevMin}–${terrain.elevMax} m)` : ""}. El contorno naranja sigue
          ese perímetro, con el norte de la imagen hacia el fondo de la vista inicial. Arrastra para
          orbitar, botón derecho para desplazar y la rueda para acercar.
        </p>
        <p className="px-4 pb-6 text-xs leading-relaxed text-[#3d5163]">
          La etapa I muestra las manzanas C, D, E y F en la franja junto a la vía, con el lado largo
          hacia el sur. Cada lote lleva su propio borde. El relieve se muestra a 1,5 para leer la
          pendiente.{" "}
          {commercial
            ? `${joined.lots.length - joined.sinComercial.length} con estado comercial, ${joined.sinComercial.length} sin ficha, ${joined.sinGeometria.length} fichas sin polígono.`
            : "La disponibilidad sale de la misma fuente de /terra/estado."}
        </p>
      </main>
    </div>
  );
}
