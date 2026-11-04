import geometria from "@/lib/terra/mapa/geometria.json";
import { joinLots, type GeomLot } from "@/lib/terra/mapa/join";
import { terraWhatsAppUrl } from "@/lib/terra/contact";
import { TERRA_PROJECT, formatCop, TERRA_LOT_TYPES } from "@/lib/terra/commercial";
import { fetchPublicLots, formatArea, isAvailableLot, lotQuoteUrl } from "@/lib/terra/lots";
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

const GEOMETRY = geometria as GeomLot[];

function referencePrice(area: number | undefined | null): number | null {
  if (area == null) return null;
  const match = TERRA_LOT_TYPES.find((type) => Math.abs(type.area - area) < 0.02);
  return match?.fromCop ?? null;
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
  const [exaggeration, setExaggeration] = useState(1);
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
  const exaggerationRef = useRef(exaggeration);
  lotsRef.current = joined.lots;
  visibleRef.current = visibleIds;
  selectedRef.current = selectedId;
  exaggerationRef.current = exaggeration;

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
      handle.setExaggeration(exaggerationRef.current);
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

  useEffect(() => {
    handleRef.current?.setExaggeration(exaggeration);
  }, [exaggeration]);

  const canQuote = selected ? isAvailableLot(selected.estado ?? "") : false;
  const price = referencePrice(selected?.medidas?.area_m2);

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
          <label className="absolute right-3 top-3 rounded-xl bg-white/95 px-3 py-2 text-xs shadow">
            Exageración vertical {exaggeration.toFixed(1)}×
            <input
              className="mt-1 block w-36"
              type="range"
              min={1}
              max={3}
              step={0.5}
              value={exaggeration}
              onChange={(event) => setExaggeration(Number(event.target.value))}
            />
          </label>
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
          El relieve y la foto comparten el recorte del KML
          {terrain ? ` (${terrain.elevMin}–${terrain.elevMax} m)` : ""}. El contorno naranja sigue
          ese perímetro, con el norte de la imagen hacia el fondo de la vista inicial. Arrastra para
          orbitar, botón derecho para desplazar y la rueda para acercar.
        </p>
        <p className="px-4 pb-6 text-xs leading-relaxed text-[#3d5163]">
          Los lotes están sobre el terreno, a la escala del área comercial y centrados en el predio.
          No hay mojones que fijen el desplazamiento ni la rotación.{" "}
          {commercial
            ? `${joined.lots.length - joined.sinComercial.length} con estado comercial, ${joined.sinComercial.length} sin ficha, ${joined.sinGeometria.length} fichas sin polígono.`
            : "La disponibilidad sale de la misma fuente de /terra/estado."}
        </p>
      </main>

      {selected && (
        <div className="fixed inset-x-0 bottom-0 z-40 sm:inset-y-auto sm:bottom-6 sm:left-auto sm:right-6 sm:top-24 sm:w-[360px]">
          <article className="max-h-[70vh] overflow-auto rounded-t-2xl border border-[#e4ebf1] bg-white/95 p-4 shadow-[0_12px_40px_rgba(14,42,71,0.18)] backdrop-blur sm:max-h-[calc(100vh-8rem)] sm:rounded-2xl">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[#1d6f8a]">
              TERRA · ETAPA I
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold">
              MANZANA {selected.manzana} · LOTE {selected.lote}
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <div>
                <dt className="text-[#5c7284]">Manzana</dt>
                <dd>{selected.manzana}</dd>
              </div>
              <div>
                <dt className="text-[#5c7284]">Lote</dt>
                <dd>{selected.lote}</dd>
              </div>
              <div>
                <dt className="text-[#5c7284]">Área</dt>
                <dd>{formatArea(selected.medidas?.area_m2)}</dd>
              </div>
              <div>
                <dt className="text-[#5c7284]">Estado</dt>
                <dd>{selected.estado ?? "Por confirmar"}</dd>
              </div>
              {price != null && (
                <div className="col-span-2">
                  <dt className="text-[#5c7284]">Precio de referencia publicado para esta área</dt>
                  <dd>Desde {formatCop(price)}</dd>
                </div>
              )}
            </dl>
            <div className="mt-4 flex flex-col gap-2">
              {canQuote ? (
                <>
                  <a
                    href={lotQuoteUrl(selected.id)}
                    className="rounded-xl bg-[#e07a2f] px-4 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Cotizar este lote
                  </a>
                  <a
                    href={terraWhatsAppUrl(selected.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-[#128C7E] px-4 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    WhatsApp
                  </a>
                </>
              ) : (
                <p className="rounded-xl bg-[#f3f6f8] px-3 py-2 text-sm text-[#3d5163]">
                  Este lote no está disponible para cotizar.
                </p>
              )}
              <button
                type="button"
                className="rounded-xl border border-[#d5dee6] px-4 py-2 text-sm"
                onClick={() => setSelectedId(null)}
              >
                Cerrar
              </button>
            </div>
            <p className="mt-3 text-[11px] text-[#5c7284]">{TERRA_PROJECT.locationLine}</p>
          </article>
        </div>
      )}
    </div>
  );
}
