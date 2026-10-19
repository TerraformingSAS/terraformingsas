# Integracion del visor TERRA

Esta rama prepara la direccion **https://www.terraformings.co/terra/estado**
sin reemplazar las rutas actuales del sitio comercial (`/`, `/terra` ni otras).

## Como funciona

- El comando `npm run build` primero ejecuta `scripts/import-terra-visor.mjs`.
- El script trae los **cinco recursos publicos** del visor (HTML, CSS, JS y dos imagenes) del despliegue actual. Compara cada uno con la huella SHA-256 del ZIP validado. Si el archivo local ya existe y coincide, lo conserva sin descargarlo de nuevo.
- Vite los incluye en la carpeta publica del sitio principal. Al visitar `/terra/estado`, una regla de Vercel entrega el HTML completo, sin iframe ni cambio de dominio. El CSS, el JavaScript y las imagenes se solicitan bajo `/terra/estado/*`, ahora servidos por el proyecto principal.
- La API `/api/terra-estado` se conecta **temporalmente** al servicio de SharePoint ya desplegado en `terraformingsas-terra-visor.vercel.app`. Esto conserva el manejo de secretos y la logica del Excel sin mezclar el servidor del visor con la compilacion de TanStack Start.
- No se toca ninguna pagina, componente, dependencia o imagen comercial existente; solo se amplian `package.json` y las reglas de Vercel.

## Requisitos de publicacion

1. Revisar y aceptar la PR solo despues de validar la vista previa de Vercel.
2. En el proyecto principal de Vercel, comprobar que **Build Command** ejecute `npm run build` (o `bun run build`) y no directamente `vite build`. Node >=22.
3. El despliegue `terraformingsas-terra-visor.vercel.app` debe seguir accesible: en esta etapa sirve la API y es fuente validada de los archivos estaticos durante la compilacion.
4. **Eliminar o desactivar las reglas CDN Routing anteriores** que intercepten `/terra/estado` o `/terra/estado/:path*` y que apunten al proyecto independiente. Esas reglas pueden anular las del repositorio. Realizar este paso coordinadamente con la publicacion de la PR.
5. Confirmar que `MS_CLIENT_SECRET` y las demas variables del visor esten configuradas en el proyecto Vercel que aloja la API. No agregar valores secretos al repositorio.

## Verificaciones en vista previa

- `/terra`: se conserva intacta la pagina comercial.
- `/terra/estado`: abre el visor.
- `/terra/estado/estilos.css`, `app.js`, `logo-terraforming.png` y `ubicacion-etapa-i.webp`: HTTP 200, no 404 ni HTML como respuesta.
- `/api/terra-estado`: HTTP 200 y `lotes` contiene 104 registros si SharePoint esta configurado (HTTP 503 si faltan credenciales).
- Interaccion: busqueda, filtros A-F, clic en poligonos, zoom, area y estado de cada lote.
- Revisar `www.terraformings.co/` y `/terra` tras el despliegue.

## Limites y proxima mejora

Esta etapa integra el visor visual completo al sitio principal sin sobrescribirlo. El **servidor de disponibilidad** permanece por ahora en el despliegue separado. Para eliminar tambien esa dependencia debe migrarse y probarse aparte la funcion de servidor y sus dependencias; no debe mezclarse con este primer cambio sin validar la plataforma Node/Nitro.

## Recuperacion

Sin cambios en `main`, basta con cerrar la PR. Tras una fusion, puede revertirse el commit y desplegar nuevamente; mantener la API del visor hasta comprobar la nueva version. No borres archivos del sitio actual para implementar esta integracion.
