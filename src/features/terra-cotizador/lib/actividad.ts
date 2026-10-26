// Última interacción real del usuario (compartida entre pestañas vía localStorage).
const KEY = "terra-ultima-actividad";
export const INACTIVIDAD_MS = 30 * 60 * 1000;
export const AVISO_MS = 2 * 60 * 1000; // avisar 2 min antes

export function ultimaActividad(): number {
  const v = Number(localStorage.getItem(KEY));
  return Number.isFinite(v) && v > 0 ? v : Date.now();
}

export function marcarActividad(): void {
  localStorage.setItem(KEY, String(Date.now()));
}

let instalado = false;
export function escucharActividad(): void {
  if (instalado) return;
  instalado = true;
  let ultimoGuardado = 0;
  const handler = () => {
    const ahora = Date.now();
    if (ahora - ultimoGuardado > 5_000) {
      ultimoGuardado = ahora;
      marcarActividad();
    }
  };
  for (const ev of ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const) {
    window.addEventListener(ev, handler, { passive: true, capture: true });
  }
}

/** fetch a la API con la marca de última actividad (el servidor solo extiende la sesión con actividad real). */
export function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("X-Ultima-Actividad", String(ultimaActividad()));
  return fetch(input, { ...init, headers, credentials: "include", cache: "no-store" });
}
