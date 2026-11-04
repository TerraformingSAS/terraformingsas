# Experiencia comercial de TERRA

Rediseño de `/terra` y `/terra/estado` como sitio oficial del proyecto, conservando el plano, el cotizador y las integraciones reales.

## Qué se conservó

- Rutas `/terra`, `/terra/estado`, `/terra/cotizador` y `/terra/avisolegal`.
- Geometría de `geometria.json`, nomenclatura, polígonos, manzanas A–F y fuente `/api/terra-estado`.
- Zoom con `+`, `−` y `Ajustar`. La rueda del mouse sigue desplazando la página.
- Cotización pública por WhatsApp (`Cotízame`) solo para lotes `Disponible`.
- Cotizador interno con `calcularFinanciacion`, 12/24/36 meses, 70/30 y 1% mensual en 24/36.
- Web3Forms + hCaptcha, Clarity (`yvum2tlvam`), GA4 (`G-T419MSNEWJ`) y píxel de Meta (`2986286885067417`).
- Footer corporativo, política de privacidad y aviso legal.

## Qué cambió

- `/terra` dejó el menú corporativo y pasó a una navegación y relato del proyecto.
- El hero ya no monta el formulario ni promociona descuentos con fecha vencida.
- Los lotes de la landing salen de `/api/terra-estado`; si la API falla no se inventan datos.
- `/terra/estado` es un explorador inmobiliario: filtros, chips, panel flotante y `?lote=C-12`.
- UTM first/last y lote seleccionado se guardan en `sessionStorage` y viajan en el formulario.
- Eventos web: `select_lot`, `view_quote`, `select_financing_plan`, `form_start`, `request_quote`, `generate_lead`, `whatsapp_click`.
- Condiciones variables viven en `src/lib/terra/commercial.ts`.

## Condiciones comerciales (corte 3 nov 2026, America/Bogota)

- La separación de $5 millones y el 70/30 se muestran porque coinciden con el cotizador vigente.
- Los descuentos originales asociados al 31 de octubre de 2026 **no** se publican como vigentes.
- El pago de cuota inicial previsto al 15 de noviembre no se usa como urgencia de marketing.

## Eventos CRM (no se disparan en la web)

Definidos en `src/lib/terra/commercial-events.ts`: `qualify_lead`, `schedule_visit`, `complete_visit`, `reservation_confirmed`. Requieren registro comercial o CRM.

## Pendiente

- Banner de consentimiento de cookies (hoy el sitio carga analítica como antes).
- Conectar los eventos CRM cuando exista el sistema comercial.
- Actualizar `TERRA_DATED_CAMPAIGNS` cuando mercadeo confirme nuevas vigencias.
