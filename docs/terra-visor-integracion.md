# Integracion de visor TERRA en el sitio principal

La rama `feature/terra-visor-integrado` agrega el visor completo en
`https://www.terraformings.co/terra/estado` conservando `/`, `/terra`
y el resto de las rutas del sitio.

## Error inicial corregido

El primer intento descargo `/terra/estado/index.html` desde el sitio
independiente; esa URL devuelve HTTP 404. El contenido HTML original
se sirve en `/terra/estado`.

**El despliegue principal ya no descarga recursos externos durante el
build.** Su script `npm run build` vuelve a ser `vite build`.

## Incorporar los archivos publicos

El workflow GitHub Actions
`.github/workflows/sync-terra-assets.yml` se ejecuta en la rama del
Pull Request. Descarga UNA VEZ los cinco recursos originales desde
`terraformingsas-terra-visor.vercel.app`, verifica sus SHA-256
contra el ZIP recibido, y los incorpora a Git:

- `public/terra/estado/index.html`
- `public/terra/estado/estilos.css`
- `public/terra/estado/app.js`
- `public/terra/estado/logo-terraforming.png`
- `public/terra/estado/ubicacion-etapa-i.webp`

El comando `npm run terra:sync` permite repetir manualmente la
comprobacion si un archivo falta; **no forma parte del build**.

Si GitHub Actions falla o no puede crear commits por permisos, ejecutar
el mismo comando localmente y subir los archivos a la rama, manteniendo
la comprobacion SHA-256. No aprobar la PR mientras falte alguno.

## Como funciona el despliegue

`vercel.json` envía `/terra/estado` a
`/terra/estado/index.html`, servido como archivo estatico del propio
sitio principal. CSS, JS y las dos imagenes se sirven igualmente desde
su `public/terra/estado/`. No requieren reglas CDN externas.

La API de disponibilidad `/api/terra-estado` usa temporalmente la
funcion de servidor **existente** en
`terraformingsas-terra-visor.vercel.app`, a traves de una regla
Vercel Rewrite. Esta API consulta SharePoint usando sus credenciales
del lado del servidor. **No copiar** los secretos Microsoft al codigo
publico. Mantener el despliegue independiente activo para esta API.

## Despliegue seguro

1. Verificar que GitHub Actions agrego los cinco recursos y que el
   Pull Request tiene un preview funcional.
2. Revisar en Vercel que el build ejecute `npm run build` y no
   `node scripts/import-terra-visor.mjs && vite build`.
   Eliminar cualquier override del build antiguo.
3. Desactivar las reglas **CDN Routing** anteriores que intercepten
   `/terra/estado` o `/terra/estado/:path*` y las dirijan al
   proyecto independiente. Podrian adelantarse al `vercel.json`
   de este repositorio.
4. Comprobar que el preview mantiene `/` y `/terra`, ademas de
   `/terra/estado`.
5. Comprobar en Network que `estilos.css`, `app.js`, logo y plano
   responden HTTP 200 con contenido real.
6. Comprobar busqueda de lote, filtros A-F, poligonos, zoom,
   seleccion de dimensiones, leyenda y disponibilidad de SharePoint.
7. Fusionar solo despues de revisar la vista previa y coordinar los
   cambios de reglas en Vercel.

## Pruebas y limites

Los archivos estaticos se cotejan byte a byte con el ZIP. Para
la API, la integracion conserva el servicio previamente desplegado:
no se ha migrado la logica del Excel a TanStack Start. Si la API
responde HTTP 503, comprobar las variables Microsoft y permisos
SharePoint configurados en el proyecto del visor.

Si se requiere independencia completa del proyecto del visor, migrar
la API en un cambio posterior con pruebas de servidor y entorno de
ejecucion. No modificar `main` ni borrar el proyecto del visor para
resolver el despliegue inicial.
