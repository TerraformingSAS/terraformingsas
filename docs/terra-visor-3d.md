# Visor TERRA 3D — rama de revisión

## Alcance implementado

- `/terra/estado` incorpora una vista 3D por defecto cuando WebGL2 y la librería Three.js están disponibles.
- La vista 2D existente permanece como alternativa, sin reemplazar ni modificar `/api/terra-estado`, la base de datos ni el sistema de cotización.
- Los 104 lotes se reconstruyen a partir de `puntos` y `centro` de la misma respuesta que usa SVG. Se invierte exclusivamente el eje Y para convertir del sistema SVG al plano cartesiano XY de Three.js: `[x, y] => [x, -y]`. No hay reajustes por manzana, desplazamientos por lote ni nuevas geometrías.
- Los estados se obtienen de la respuesta vigente y se actualizan cada 60 segundos, según el código anterior. Los lotes A y B se muestran en gris en la escena 3D; las reglas de estado siguen llegando de la API.
- Los clics sobre geometrías 3D pasan por `window.terraMapBridge.selectLot`, que conserva Clarity, GA4, la URL `?lote=...`, el formulario, el estado de cotización y WhatsApp.
- La cámara usa proyección ortográfica con inclinación fija para reducir distorsión, acercamiento animado al lote y desplazamiento con arrastre. La rueda del ratón no hace zoom. En dispositivos táctiles hay desplazamiento con un dedo y zoom con dos.
- Las preferencias `prefers-reduced-motion` evitan movimientos animados; si falla Three.js, WebGL2 o el contexto gráfico, el SVG sigue disponible.

## Límites de precisión

El DWG adjunto `SOLICITUD 31-10-26.dwg` está en formato AC1032 (AutoCAD 2018–2020). En el entorno de implementación no estaba disponible una herramienta fiable para importar sus entidades. **No se ha afirmado ni validado que el archivo DWG coincida con los 104 polígonos publicados.** Se conservó intacta la geometría del repositorio.

La foto `ubicacion-etapa-i.webp` se mantiene en la sección de ubicación. **No se ha superpuesto a la escena 3D**, porque faltan puntos de control que relacionen cada coordenada del plano vectorial con los píxeles de esa foto. Mostrarla como una textura exacta sin georreferenciación sería engañoso y podría desplazar visualmente los lotes. El fondo del visor es neutro y vectorial hasta validar esa alineación.

El visor representa una elevación estilizada de los lotes sobre un plano base. No pretende simular topografía o pendientes reales del terreno: para ello haría falta un modelo digital de elevaciones.

## Archivos y pruebas

- `public/terra/estado/scene-3d.js`: escena 3D bajo demanda y cámara, eventos y tratamiento de fallos.
- `public/terra/estado/app.js`: puente entre la lógica comercial del SVG y el motor de Three.js.
- `public/terra/estado/index.html`: alternador de vistas y contenedor 3D.
- `public/terra/estado/estilos.css`: presentación y adaptación responsive.
- `scripts/verify-terra-visor.mjs`: conserva verificaciones comerciales y comprueba elementos de la integración 3D.
- `.github/workflows/verify-terra-3d.yml`: comprobaciones de sintaxis, pruebas del visor, tests, build y servidor.

Ejecutar:

```sh
npm ci
node --check public/terra/estado/app.js
node --check public/terra/estado/scene-3d.js
npm run terra:verify
npm run terra:test
npm run build
```

Verificar adicionalmente de forma manual con una vista previa local o aislada: selección de cada lote, cambios sucesivos de selección, página con `?lote=C-01`, carga de estados desde SharePoint, búsqueda, filtros, rueda de ratón, gestos táctiles, WebGL2 desactivado y enlaces WhatsApp/formulario. La compilación y los tests de CI no sustituyen estas pruebas visuales.

**No hacer merge a `main` ni desplegar a producción sin la revisión visual y cartográfica.**
