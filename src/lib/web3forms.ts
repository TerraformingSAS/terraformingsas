/**
 * Web3Forms utiliza una clave pública para identificar el formulario.
 * El formulario general y el de TERRA envían a la misma cuenta.
 */
export const WEB3FORMS_ACCESS_KEY = "bbf249ee-fab7-45d0-9bee-0c0cf71f3af4";

export async function sendWeb3Forms(data: FormData, captchaToken: string): Promise<void> {
  if (!captchaToken) {
    throw new Error("Completa la verificación de seguridad.");
  }

  data.set("access_key", WEB3FORMS_ACCESS_KEY);
  data.set("h-captcha-response", captchaToken);

  let response: Response;
  try {
    response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: data,
    });
  } catch {
    throw new Error("Error de conexión. Revisa tu red e inténtalo de nuevo.");
  }

  const result: { success?: boolean } | null = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    if (response.status === 429) {
      throw new Error("Hay demasiadas solicitudes. Espera un momento e inténtalo de nuevo.");
    }
    throw new Error("No se pudo enviar. Revisa el CAPTCHA e inténtalo nuevamente.");
  }
}
