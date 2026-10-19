import { useEffect, useRef, useState } from "react";

// Clave pública compartida de hCaptcha para formularios de Web3Forms (plan gratuito).
const WEB3FORMS_HCAPTCHA_SITE_KEY = "50b2fe65-b00b-4b9e-ad62-3ba471098be2";
const SCRIPT_ID = "terra-web3forms-hcaptcha";

type WidgetId = string | number;

type HCaptchaClient = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      size: "compact" | "normal";
      hl: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => WidgetId;
  reset: (id: WidgetId) => void;
  remove?: (id: WidgetId) => void;
};

declare global {
  interface Window {
    hcaptcha?: HCaptchaClient;
    terraWeb3FormsCaptchaReady?: () => void;
  }
}

let loadingScript: Promise<void> | null = null;

function loadHCaptcha(): Promise<void> {
  if (window.hcaptcha) return Promise.resolve();

  if (!loadingScript) {
    loadingScript = new Promise<void>((resolve, reject) => {
      window.terraWeb3FormsCaptchaReady = () => {
        if (window.hcaptcha) resolve();
        else reject(new Error("hCaptcha no está disponible"));
      };

      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src =
        "https://js.hcaptcha.com/1/api.js?render=explicit&recaptchacompat=off&hl=es&onload=terraWeb3FormsCaptchaReady";
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error("No se pudo cargar hCaptcha"));
      document.head.appendChild(script);
    }).catch((error: unknown) => {
      loadingScript = null;
      document.getElementById(SCRIPT_ID)?.remove();
      throw error;
    });
  }

  return loadingScript;
}

/**
 * El token se envía a Web3Forms, que verifica hCaptcha en el servidor
 * cuando se activa hCaptcha en la configuración de la cuenta.
 */
export function Web3FormsCaptcha({
  onTokenChange,
  resetKey,
}: {
  onTokenChange: (token: string) => void;
  resetKey: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<WidgetId | null>(null);
  const tokenCallback = useRef(onTokenChange);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    tokenCallback.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    let active = true;

    void loadHCaptcha()
      .then(() => {
        if (!active || !containerRef.current || !window.hcaptcha) return;

        widgetRef.current = window.hcaptcha.render(containerRef.current, {
          sitekey: WEB3FORMS_HCAPTCHA_SITE_KEY,
          size: "compact",
          hl: "es",
          callback: (token) => {
            setLoadError("");
            tokenCallback.current(token);
          },
          "expired-callback": () => tokenCallback.current(""),
          "error-callback": () => {
            tokenCallback.current("");
            setLoadError("No se pudo completar el CAPTCHA. Vuelve a intentarlo.");
          },
        });
      })
      .catch(() => {
        if (active) setLoadError("No se pudo cargar el CAPTCHA. Actualiza la página.");
      });

    return () => {
      active = false;
      if (widgetRef.current !== null) {
        window.hcaptcha?.remove?.(widgetRef.current);
        widgetRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (widgetRef.current !== null) {
      window.hcaptcha?.reset(widgetRef.current);
      tokenCallback.current("");
    }
  }, [resetKey]);

  return (
    <div className="space-y-2">
      <div ref={containerRef} aria-label="Verificación de seguridad" />
      {loadError && (
        <p role="alert" className="text-xs text-red-600">
          {loadError}
        </p>
      )}
    </div>
  );
}
