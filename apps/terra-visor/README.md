# TERRA Etapa I — Disponibilidad

Visor de solo lectura para Vercel. Consulta cada 60 segundos un Excel privado en SharePoint mediante una función de servidor autenticada con Microsoft Graph. Conserva los 104 polígonos validados. No incluye el Excel ni datos de clientes o precios.

**Conexión SharePoint implementada con los identificadores reales; falta introducir MS_CLIENT_SECRET en Vercel y probar el despliegue.** El repositorio recibido solo tenía el archivo `DV`. El sitio comercial no está incluido.

[Instrucciones previas de Microsoft 365, Vercel y dominio](docs/CONFIGURAR_MICROSOFT_Y_VERCEL.md).

- Página: `/terra/estado`
- API de solo lectura: `/api/terra-estado`
- Variables de servidor: `.env.example`
- Pruebas: `npm install`, `npm test`
- Compilación: `npm run build`

El despliegue usa Node 22. Las pruebas locales se ejecutaron con Node 24. El servidor no utiliza las APIs de edición de libros Excel: descarga el `.xlsx` en memoria, valida sus hojas y devuelve una selección de datos públicos. Las credenciales permanecen en Vercel. No hay un archivo estático de estados que deba actualizarse por cada venta.

Activación con la configuración actual: [ACTIVAR_CONEXION.txt](docs/ACTIVAR_CONEXION.txt). Solo falta configurar la variable secreta MS_CLIENT_SECRET. Los identificadores ya están en el servidor.
