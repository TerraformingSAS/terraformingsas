import geometria from "@/lib/terra/mapa/geometria.json";
import hallazgos from "@/lib/terra/mapa/cad-hallazgos.json";
import { joinLots, type GeomLot, type JoinedLot } from "@/lib/terra/mapa/join";
import { terraWhatsAppUrl } from "@/lib/terra/contact";
import { TERRA_PROJECT, formatCop, TERRA_LOT_TYPES } from "@/lib/terra/commercial";
import { fetchPublicLots, formatArea, isAvailableLot, lotQuoteUrl } from "@/lib/terra/lots";
import { TerraHeader } from "@/components/terra/TerraHeader";
import { useEffect, useMemo, useRef, useState } from "react";

const COLORS: Record<string, string> = {
  Disponible: "#66b48a",
  Reservado: "#ebcb6a",
  "En negociación": "#86b9da",
  Vendido: "#db8179",
  "No disponible": "#b4b9b4",
};

const GEOMETRY = geometria as GeomLot[];

type View = { minX: number; minY: number; width: number; height: number };

function boundsOf(lots: { puntos: [number, number][] }[], padRatio = 0.06): View {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const lot of lots) {
    for (const [x, y] of lot.puntos) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  const width = maxX - minX;
  const height = maxY - minY;
  const padX = width * padRatio;
  const padY = height * padRatio;
  return {
    minX: minX - padX,
    minY: minY - padY,
    width: width + padX * 2,
    height: height + padY * 2,
  };
}

function focusView(lot: JoinedLot, aspect: number): View {
  const box = boundsOf([lot], 0);
  const cx = box.minX + box.width / 2;
  const cy = box.minY + box.height / 2;
  let width = box.width * 4.2;
  let height = box.height * 4.2;
  if (width / height > aspect) height = width / aspect;
  else width = height * aspect;
  return { minX: cx - width / 2, minY: cy - height / 2, width, height };
}

function referencePrice(area: number | undefined | null): number | null {
  if (area == null) return null;
  const match = TERRA_LOT_TYPES.find((type) => Math.abs(type.area - area) < 0.02);
  return match?.fromCop ?? null;
}

export function TerraMapa() {
  const [commercial, setCommercial] = useState<Awaited<ReturnType<typeof fetchPublicLots>> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [manzana, setManzana] = useState("");
  const [estado, setEstado] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const fit = useMemo(() => boundsOf(GEOMETRY), []);
  const [view, setView] = useState<View>(fit);
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; view: View; moved: boolean } | null>(null);
  const dragged = useRef(false);

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

  const selected = joined.lots.find((lot) => lot.id === selectedId) ?? null;
  const labelMin = Math.min(view.width, view.height) / 90;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function aspect() {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect || rect.height === 0) return fit.width / fit.height;
    return rect.width / rect.height;
  }

  function selectLot(lot: JoinedLot) {
    setSelectedId(lot.id);
    setView(focusView(lot, aspect()));
    const url = new URL(window.location.href);
    url.searchParams.set("lote", lot.id);
    window.history.replaceState(null, "", url);
  }

  function onPointerDown(event: React.PointerEvent) {
    if (event.button !== 0) return;
    (event.currentTarget as Element).setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, view, moved: false };
  }

  function onPointerMove(event: React.PointerEvent) {
    const current = drag.current;
    if (!current) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (Math.hypot(dx, dy) > 4) current.moved = true;
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    setView({
      ...current.view,
      minX: current.view.minX - (dx / rect.width) * current.view.width,
      minY: current.view.minY - (dy / rect.height) * current.view.height,
    });
  }

  function onPointerUp() {
    dragged.current = drag.current?.moved ?? false;
    drag.current = null;
  }

  function zoom(factor: number) {
    const cx = view.minX + view.width / 2;
    const cy = view.minY + view.height / 2;
    const width = view.width / factor;
    const height = view.height / factor;
    setView({ minX: cx - width / 2, minY: cy - height / 2, width, height });
  }

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
              Mapa del loteo
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
          <div
            className="inline-flex rounded-lg bg-white p-0.5 shadow-sm"
            role="group"
            aria-label="Tipo de vista"
          >
            {(["2d", "3d"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={`rounded-md px-3 py-1.5 text-sm ${mode === item ? "bg-[#0e2a47] text-white" : ""}`}
                onClick={() => setMode(item)}
              >
                Vista {item.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mx-3 mb-3 min-h-[70vh] flex-1 overflow-hidden rounded-2xl bg-[#d5e0e6] shadow-[0_8px_30px_rgba(14,42,71,0.12)] sm:mx-4">
          {loading && (
            <p className="absolute left-3 top-3 z-10 rounded-lg bg-white/90 px-3 py-2 text-sm shadow">
              Cargando disponibilidad…
            </p>
          )}
          {error && (
            <p
              className="absolute left-3 top-3 z-10 max-w-sm rounded-lg bg-white px-3 py-2 text-sm shadow"
              role="alert"
            >
              {error} El plano sigue visible; el estado comercial no se pudo consultar.
            </p>
          )}
          <div
            ref={frame}
            className="h-full min-h-[70vh] touch-none"
            style={{ perspective: mode === "3d" ? "1200px" : undefined }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <svg
              className="h-full w-full"
              viewBox={`${view.minX} ${view.minY} ${view.width} ${view.height}`}
              role="img"
              aria-label="Plano de lotes de TERRA"
              style={{
                transform: mode === "3d" ? "rotateX(52deg) scale(0.92)" : undefined,
                transformOrigin: "center center",
              }}
            >
              <rect
                x={view.minX}
                y={view.minY}
                width={view.width}
                height={view.height}
                fill="#d7e3dc"
              />
              {GEOMETRY.map((lot) => {
                const shown = visible.some((item) => item.id === lot.id);
                const data = joined.lots.find((item) => item.id === lot.id);
                const active = lot.id === selectedId;
                const hot = lot.id === hoverId;
                const fill = data?.estado ? (COLORS[data.estado] ?? "#c5ced6") : "#c5ced6";
                return (
                  <polygon
                    key={lot.id}
                    points={lot.puntos.map((point) => point.join(",")).join(" ")}
                    fill={shown ? fill : "#e4eaee"}
                    stroke={active ? "#e07a2f" : "#0e2a47"}
                    strokeWidth={active ? view.width / 280 : view.width / 900}
                    opacity={shown ? 1 : 0.45}
                    className="cursor-pointer"
                    style={{ filter: active || hot ? "brightness(1.06)" : undefined }}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (dragged.current) return;
                      if (data) selectLot(data);
                    }}
                    onPointerEnter={() => setHoverId(lot.id)}
                    onPointerLeave={() =>
                      setHoverId((current) => (current === lot.id ? null : current))
                    }
                  >
                    <title>{`${lot.id}${data?.estado ? ` · ${data.estado}` : ""}`}</title>
                  </polygon>
                );
              })}
              {view.width < fit.width * 0.55 &&
                visible.map((lot) => (
                  <text
                    key={`${lot.id}-label`}
                    x={lot.centro[0]}
                    y={lot.centro[1]}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={labelMin}
                    fill="#0e2a47"
                    style={{ pointerEvents: "none" }}
                  >
                    {lot.lote}
                  </text>
                ))}
            </svg>
          </div>

          <div className="absolute bottom-3 left-3 flex flex-col gap-1">
            <button
              type="button"
              className="h-9 w-9 rounded-lg bg-white text-lg shadow"
              onClick={() => zoom(1.25)}
              aria-label="Acercar"
            >
              +
            </button>
            <button
              type="button"
              className="h-9 w-9 rounded-lg bg-white text-lg shadow"
              onClick={() => zoom(0.8)}
              aria-label="Alejar"
            >
              −
            </button>
            <button
              type="button"
              className="h-9 rounded-lg bg-white px-2 text-xs shadow"
              onClick={() => setView(fit)}
            >
              Ajustar
            </button>
          </div>
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

        <p className="px-4 pb-6 text-xs leading-relaxed text-[#3d5163]">
          {hallazgos.geometriaPublicada.lotes} lotes del plano publicado (manzanas{" "}
          {Object.entries(hallazgos.geometriaPublicada.manzanas)
            .map(([block, count]) => `${block} ${count}`)
            .join(", ")}
          ). El DWG del 31-10-26 no incluye un polígono por lote y el KML solo trae el perímetro del
          predio, así que este visor no superpone una imagen satelital.{" "}
          {commercial
            ? `${joined.lots.length - joined.sinComercial.length} polígonos con estado comercial. ${joined.sinComercial.length} sin ficha. ${joined.sinGeometria.length} fichas sin polígono.`
            : "La disponibilidad se consulta en la misma fuente de /terra/estado."}
        </p>
      </main>

      {selected && (
        <div className="fixed inset-x-0 bottom-0 z-40 sm:inset-y-auto sm:bottom-6 sm:right-6 sm:left-auto sm:top-24 sm:w-[360px]">
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
