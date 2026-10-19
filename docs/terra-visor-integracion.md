# Visor TERRA integrado en el sitio comercial

Esta rama incorpora los **cinco archivos publicos originales** del ZIP en
`public/terra/estado/` (HTML, CSS, JavaScript, logo y plano), sin alterar
las paginas existentes del sitio. Los cinco archivos se almacenan en
GitHub: el build de Vercel **NO descarga recursos de otro servidor**.

## Error original y correccion

El script anterior intentaba descargar `index.html` de un Vercel ajeno
y fallaba con HTTP 404. Se retiro esa descarga del build, se eliminaron
el script y el flujo temporal de sincronizacion y se incorporaron los
archivos originales, conservando sus nombres y rutas.

## Rutas

- `/terra`: pagina comercial existente, sin cambios.
- `/terra/estado`: visor completo; el rewrite local sirve
  `/terra/estado/index.html`.
- `/terra/estado/estilos.css`: estilos.
- `/terra/estado/app.js`: filtros A-F, seleccion, busqueda, zoom y refresco.
- `/terra/estado/logo-terraforming.png` y
  `/terra/estado/ubicacion-etapa-i.webp`: imagenes.
- `/api/terra-estado`: proxy temporal al API de SharePoint alojado en
  `https://terraformingsas-terra-visor.vercel.app/api/terra-estado`.

## Verificacion antes de fusionar

1. Ejecutar `npm run terra:verify`: comprueba SHA-256 de los cinco
   archivos del ZIP, que el HTML los referencia y que JavaScript usa
   la ruta `/api/terra-estado`.
2. Ejecutar `npm ci && npm run build`, o revisar el resultado del
   workflow de GitHub Actions para esta PR.
3. En Vercel, comprobar que **Build Command** ejecute `npm run build`,
   NO el antiguo `node scripts/import-terra-visor.mjs && vite build`.
4. En el proyecto principal, **desactivar las reglas CDN Routing
   anteriores** que reescriben `/terra/estado` y
   `/terra/estado/:path*` hacia el otro Vercel. Son incompatibles
   con servir estos archivos desde el despliegue principal.
5. Abrir el Preview del PR. Comprobar respuesta HTTP 200 y tipo
   correcto de HTML/CSS/JS/imagenes, ademas de busqueda, zoom,
   filtros, seleccion, leyenda, 104 poligonos y disponibilidad.
6. Probar `/` y `/terra`: no deben mostrar cambios.
7. Fusionar la PR solo tras revisar el Preview; despues revisar
   los controles DNS y reglas CDN en produccion.

## Dependencia que permanece

El sitio principal incorpora de forma local los recursos publicos.
La funcion privada que lee el Excel de SharePoint **sigue alojada en
el proyecto Vercel del visor** y es consumida via rewrite de
`/api/terra-estado`. No eliminar ese proyecto ni compartir
`MS_CLIENT_SECRET` hasta migrar y probar su funcion de servidor.

Si la API responde HTTP 503, verificar las credenciales y
permisos Microsoft en el proyecto del visor. No se han
copiado datos privados, contrasenas ni el Excel a GitHub.
