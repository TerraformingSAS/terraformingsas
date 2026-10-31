# Cotizador admin · Upstash Redis

Las pantallas de **Administrador** (`Rol = Administrador` en SharePoint **Vendedores Cotizador**) usan **Upstash Redis** para:

- Parámetros editables (`/terra/cotizador/parametros`)
- Estadísticas / métricas por lote (`/terra/cotizador/estadisticas`)

Se abren desde la navegación superior del cotizador (no como modal). Los precios por lote siguen viniendo del Excel en SharePoint (solo lectura).

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

- Si Redis no tiene parámetros, la primera lectura (`GET /api/parametros`) siembra todos los defaults (cálculo + mensajes + pagos + contacto + tarifa).
- Si Redis ya tiene datos pero faltan claves de mensajes del PDF, esas claves se completan solas (sin pisar valores ya guardados).
- Guardar desde el panel escribe en Redis.
- Cada vez que un vendedor **genera** una cotización se agrega un registro al log.
- Las estadísticas agrupan ese log por `IdLote`.

## Mensajes de la cotización (PDF)

Claves bajo `terra:cotizador:parametros`:

| Clave | Uso |
|---|---|
| `msg_cuota_extra` | Texto bajo cuotas 24/36 |
| `msg_cuotas_valorizacion` | Disclaimer de valorización/IPC |
| `msg_no_reserva` | Disclaimer de no reserva |
| `empresa_nombre`, `nit`, `banco`, `cuenta` | Bloque de pagos |
| `email_mercadeo`, `telefono`, `direccion` | Contacto |
| `vigencia_dias` | Vigencia en días calendario |

### Sembrar a mano

- Panel admin → **Sembrar mensajes** (`POST /api/admin/parametros/seed`). Body opcional `{ "forzar": true }` para pisar valores existentes.
- CLI (con vars de Vercel):

```bash
vercel env pull .env.local --environment=production --yes
set -a && source .env.local && set +a
node scripts/seed-terra-parametros-redis.mjs
# opcional: --forzar
```
