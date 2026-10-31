# Listas SharePoint · Cotizador admin

El cotizador usa la lista **Vendedores Cotizador** (ya existente). El campo `Rol` con valor exacto **`Administrador`** habilita:

- Módulo superior de estadísticas
- Panel lateral de parámetros

## Listas nuevas

Crearlas en el mismo sitio Portal Cliente Terra (o ejecutar `node scripts/setup-terra-cotizador-listas.mjs` con credenciales Graph).

### Parametros Cotizador

| Columna | Tipo | Notas |
|---|---|---|
| Title | Texto | Clave (`separacion_cop`, `vigencia_dias`, …) |
| Valor | Texto | Valor serializado |
| Tipo | Texto | `numero` \| `texto` \| `json` |
| Grupo | Texto | `calculo` \| `tarifa` \| `mensajes` \| `pagos` \| `contacto` |
| Descripcion | Texto | Ayuda en UI |

Env: `SP_PARAMETROS_LIST_ID`

Si falta el ID, la app usa defaults de código (lectura OK; guardar desde admin falla con mensaje claro).

### Cotizaciones Cotizador

| Columna | Tipo |
|---|---|
| Title | Código de cotización |
| LoteId | Texto |
| IdLote | Texto |
| ClienteNombre / ClienteCC / ClienteEmail | Texto |
| VendedorNombre / VendedorEmail | Texto |
| Porcentaje / Cuotas / ValorPreventa | Número |
| Fecha | Fecha y hora |
| Referido | Texto |

Env: `SP_COTIZACIONES_LIST_ID`

Si falta el ID, el historial se guarda en Redis (Upstash) como fallback.

## Permisos

La app Azure **TERRA Disponibilidad** necesita Sites.ReadWrite.All (o permisos equivalentes) sobre el sitio para leer/escribir estas listas.
