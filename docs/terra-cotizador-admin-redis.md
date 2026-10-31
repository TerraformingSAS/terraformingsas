# Cotizador admin · Upstash Redis

El panel de **Administrador** (`Rol = Administrador` en la lista SharePoint **Vendedores Cotizador**) usa **Upstash Redis** para:

- Parámetros editables (cálculo, mensajes, pagos, contacto, tarifa)
- Historial de cotizaciones / métricas por lote

Los precios por lote siguen viniendo del Excel en SharePoint (solo lectura en el panel).

## Variables requeridas

Las mismas que ya usa el OTP/sesión:

- `UPSTASH_REDIS_REST_URL` (o `KV_REST_API_URL`)
- `UPSTASH_REDIS_REST_TOKEN` (o `KV_REST_API_TOKEN`)

Deben estar habilitadas también en **Preview** de Vercel si se prueba allí.

## Claves Redis

| Clave | Contenido |
|---|---|
| `terra:cotizador:parametros` | Objeto JSON `{ [clave]: valor }` |
| `terra:cotizaciones:log` | Array JSON de cotizaciones generadas (máx. 2000) |

## Comportamiento

- Si Redis no tiene parámetros guardados, la app usa defaults de código.
- Guardar desde el panel escribe en Redis.
- Cada vez que un vendedor **genera** una cotización se agrega un registro al log.
- Las estadísticas agrupan ese log por `IdLote`.
