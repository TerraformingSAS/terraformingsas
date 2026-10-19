# Integración del visor de lotes TERRA

Esta rama integra todo en el único proyecto asociado a
`https://www.terraformings.co`.

## Sitio público

- `/` y `/terra`: permanecen sin modificaciones.
- `/terra/estado`: visor original con sus recursos estáticos en `public/terra/estado/`.
- `/api/terra-estado`: ruta de servidor de TanStack Start que llama al
  handler del ZIP, ubicado en `src/server/terra/api/terra-estado.cjs`.
- `src/server/terra/lib/`: conserva el código original para Microsoft Graph,
  el catálogo geométrico y el análisis del archivo XLSX.

El HTML, CSS, JavaScript, las imágenes, el análisis Excel y la API ya
no necesitan ningún segundo proyecto Vercel.

## Dependencias

Se incorporaron `fflate` y `fast-xml-parser` en las dependencias de
ejecución, y `exceljs` como dependencia de desarrollo para probar
archivos XLSX simulados. GitHub Actions actualiza los archivos
`package-lock.json` y `bun.lock` en la rama de revisión.

## Configuración necesaria en Vercel

En el proyecto principal, configura **MS_CLIENT_SECRET** en
Settings > Environment Variables, para Preview y Production según proceda.
El valor es el secreto activo de la aplicación Microsoft; **nunca** lo
guardes en GitHub. Los identificadores no secretos de tenant, aplicación,
unidad y archivo provienen del archivo de configuración del ZIP en
`src/server/terra/lib/sharepoint-config.json`. Si cambian, se pueden
sobrescribir mediante las variables de servidor `MS_TENANT_ID`,
`MS_CLIENT_ID`, `SP_DRIVE_ID` y `SP_ITEM_ID`.

En Vercel, usa el proyecto principal conectado al repositorio desde la
raíz, Node.js 22 o compatible y el comando de compilación `npm run build`.
La configuración Nitro deja de forzar el preset de Cloudflare para que
Vercel pueda detectar su propio servidor.

**Eliminar las antiguas reglas externas CDN Routing** que apuntaban
`/terra/estado`, `/terra/estado/:path*` o `/api/terra-estado` al
proyecto eliminado. `vercel.json` únicamente mantiene las rutas
estáticas locales del visor.

## Comprobación antes de fusionar

```sh
npm ci
npm run terra:verify
npm run terra:test
npm run build
```

La primera prueba confirma que los archivos públicos y los módulos del
servidor coinciden con el ZIP y que no quedan dependencias del Vercel
anterior. Los tests verifican geometrías, 104 lotes, filtrado de datos
privados, lectura de XLSX y un flujo Graph simulado.

En la vista previa de Vercel también se deben comprobar las páginas
`/` y `/terra`, los estilos, imágenes, búsqueda y filtros del visor,
y la respuesta `/api/terra-estado`: 104 lotes al conectar SharePoint o
error controlado 503 si falta el secreto.

La conexión **real** con SharePoint solo puede verificarse cuando
`MS_CLIENT_SECRET` esté configurado en Vercel. Los tests simulan
Microsoft Graph y no sustituyen esa comprobación en producción.

**No fusionar la rama a main hasta superar estas comprobaciones.**
