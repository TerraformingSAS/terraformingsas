> Actualización: ya se confirmó la autorización read del sitio y se identificó el archivo real. Los cuatro identificadores están en lib/sharepoint-config.json. Para activar esta entrega sigue ACTIVAR_CONEXION.txt: solo es obligatoria MS_CLIENT_SECRET. Los pasos siguientes se conservan como referencia de configuración desde cero.

# TERRA: Excel privado de SharePoint y visor en Vercel

El repositorio recibido contiene solo `DV`; esta entrega añade un proyecto independiente para el visor. No reemplaza el sitio comercial. La publicación y la conexión con Microsoft todavía requieren los pasos siguientes.

## 1. Registrar la aplicación de lectura

En https://entra.microsoft.com entra con tu cuenta administradora:

1. Ve a **Entra ID → Registros de aplicaciones → Nuevo registro**.
2. Nombre: **TERRA Disponibilidad**.
3. Selecciona **Solo cuentas de este directorio organizativo**. Deja vacía la URI de redirección: esta conexión funciona entre servidores.
4. Registra y copia **Id. de directorio (inquilino)** y **Id. de aplicación (cliente)**. Serán `MS_TENANT_ID` y `MS_CLIENT_ID` en Vercel.
5. En **Permisos de API → Agregar un permiso → Microsoft Graph → Permisos de aplicación**, agrega **Sites.Selected**.
6. Concede consentimiento de administrador. Este permiso por sí solo todavía no da acceso a ningún sitio.
7. En **Certificados y secretos → Secretos de cliente → Nuevo secreto**, crea una credencial con la duración permitida por tu organización. Copia su **Valor**, no el Id. del secreto, directamente en Vercel como `MS_CLIENT_SECRET`. No lo publiques en GitHub ni lo envíes al chat. Anota la caducidad y reemplázalo antes de que expire.

La app de ejecución necesita únicamente `Sites.Selected` y una asignación `read` al sitio TERRA. No agregues `Sites.Read.All`, `Files.Read.All` ni permisos de escritura a esta app.

## 2. Darle lectura al sitio TERRA

Esto se hace una sola vez desde una sesión administradora, separada de la app de ejecución. Puedes usar Microsoft Graph Explorer:
https://developer.microsoft.com/en-us/graph/graph-explorer

Inicia sesión con tu cuenta administradora. Para consultar el sitio y asignar el permiso, la sesión administrativa de Graph Explorer necesita el permiso delegado **Sites.FullControl.All**, con consentimiento de administrador, y un rol admitido por Microsoft para la operación. Este permiso administrativo NO se agrega a la aplicación TERRA.

Ejecuta GET:

```text
https://graph.microsoft.com/v1.0/sites/intelecto1.sharepoint.com:/sites/portal-cliente-terra-6e7a83?$select=id,webUrl
```

Copia `id` del resultado como SITE_ID (incluye las comas; no es el nombre del sitio).

Luego ejecuta POST a:

```text
https://graph.microsoft.com/v1.0/sites/SITE_ID/permissions
```

Con encabezado `Content-Type: application/json` y este cuerpo, sustituyendo CLIENT_ID por el Id. de la aplicación TERRA:

```json
{
  "roles": ["read"],
  "grantedToIdentities": [{
    "application": {
      "id": "CLIENT_ID",
      "displayName": "TERRA Disponibilidad"
    }
  }]
}
```

Comprueba una respuesta de creación correcta. Con ello la aplicación puede leer el sitio seleccionado; el código solo solicita el Excel configurado. Si tu organización exige acceso limitado exclusivamente al archivo, debe configurarse el permiso seleccionado de archivo en lugar de Sites.Selected antes de activar producción.

## 3. Identificar el archivo

En la misma sesión administrativa ejecuta GET:

```text
https://graph.microsoft.com/v1.0/sites/SITE_ID/drives?$select=id,name,webUrl
```

Selecciona la biblioteca que corresponde a **Shared Documents / Documentos** en el sitio TERRA. Copia su `id` como `SP_DRIVE_ID`.

Lista el contenido de la raíz:

```text
https://graph.microsoft.com/v1.0/drives/DRIVE_ID/root/children?$select=id,name,folder,file
```

Si el Excel está dentro de una carpeta, usa el `id` de esa carpeta:

```text
https://graph.microsoft.com/v1.0/drives/DRIVE_ID/items/ID_CARPETA/children?$select=id,name,folder,file
```

Repite hasta encontrar **TERRA_Control_Lotes.xlsx** y copia su `id` como `SP_ITEM_ID`.

El enlace de compartir recibido no sustituye estos identificadores. No necesitas crear un enlace público. Edita este archivo y guarda; evita borrarlo y volverlo a crear, pues cambiaría el Id. usado por la conexión.

## 4. Configurar el proyecto del visor en Vercel

Solo cuando el código de esta entrega esté en GitHub:

1. En Vercel importa **TerraformingSAS/terra-public-DV** como proyecto del visor. Si ya existe ese proyecto, úsalo.
2. Framework: **Other**. Root Directory: raíz del repositorio. El archivo `vercel.json` define compilación y carpeta de salida.
3. En **Settings → Environment Variables** añade para **Production**:

| Variable | Valor |
| --- | --- |
| `MS_TENANT_ID` | Id. de directorio de Microsoft Entra |
| `MS_CLIENT_ID` | Id. de la aplicación TERRA |
| `MS_CLIENT_SECRET` | Valor del secreto, guardado solo en Vercel |
| `SP_DRIVE_ID` | Id. de la biblioteca del paso 3 |
| `SP_ITEM_ID` | Id. del Excel del paso 3 |

No añadas prefijos públicos como `NEXT_PUBLIC_`. No habilites las credenciales de producción en previews ajenas al proyecto.

4. Publica o vuelve a desplegar una vez guardadas las variables. No subas el Excel ni archivos `.env` al repositorio.
5. Abre `/api/terra-estado` en el dominio asignado por Vercel. Debe devolver los 104 lotes con datos públicos. Si muestra un error de consulta, comprueba credenciales, caducidad, permiso de lectura y los dos identificadores. La respuesta no muestra información interna del error.
6. Abre `/terra/estado` en ese mismo dominio. Comprueba selección, colores y área de F-01: 442,75 m².

## 5. Mostrarlo en www.terraformings.co/terra/estado

No cambies el dominio del sitio comercial al nuevo proyecto del visor.

Hay dos opciones:

- **Mismo proyecto:** integrar estos archivos y la función dentro del repositorio comercial, adaptando su framework y combinando las rutas. Requiere el código del sitio comercial.
- **Proyecto separado:** agregar reglas de reescritura al proyecto que YA sirve www.terraformings.co. Se incluye `docs/rewrites-sitio-comercial.example.json`. Sustituye `VISOR_ORIGIN` por el origen estable del proyecto del visor, por ejemplo su dominio de producción `https://nombre-real.vercel.app`. Combina las reglas con las existentes; no reemplaces toda la configuración. Las reglas específicas deben ir antes de reglas generales que capturen `/terra/*` o `/api/*`.

Deben redirigirse internamente la página, sus recursos y `/api/terra-estado`. No basta con reenviar solo el HTML. No agregues estas reglas al propio visor apuntándolo a sí mismo: produciría un bucle.

No puede verificarse esta integración de dominio hasta tener la configuración del proyecto comercial. Si el visor está protegido por Vercel Deployment Protection, su origen debe permitir la consulta de clientes o la reescritura devolverá una página de acceso.

## 6. Uso diario

1. Abre el Excel maestro de SharePoint, desde Excel en línea o con sincronización.
2. En **Lotes**, modifica **Estado** y, si corresponde, **Area_m2**.
3. Guarda y espera a que termine la sincronización.
4. El visor abierto consulta cada 60 segundos. El servidor conserva una lectura válida hasta 30 segundos para reducir solicitudes; el cambio puede tardar hasta unos 90 segundos más el tiempo de sincronización.
5. No hay que publicar de nuevo por cambios en los datos ni tener encendido el Mac.

Se conservan los 104 IDs y las hojas **Lotes** y **Tipos de area**. Los estados admitidos son Disponible, Reservado, En negociación, Vendido y No disponible. Un área individual numérica prevalece sobre el área de su tipo. Las dimensiones vienen del catálogo de tipos. La asignación de tipos conserva la numeración validada del plano.

Si la conexión falla, la vista avisa y, cuando ya había cargado, mantiene la última lectura en la pestaña. No la presenta como una actualización reciente. Al abrir una pestaña nueva sin conexión no se muestra un inventario antiguo como si fuera actual.

## Verificación pendiente

Las pruebas locales comprueban lectura del Excel original, cambios de estado y área, rechazo de IDs duplicados, cantidades y estados inválidos, ausencia de campos comerciales privados y errores seguros de la API. No sustituyen la prueba con el archivo remoto y las credenciales reales.

## Documentación oficial

- Registro de aplicación: https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app
- Permisos seleccionados: https://learn.microsoft.com/en-us/graph/permissions-selected-overview
- Asignación al sitio: https://learn.microsoft.com/en-us/graph/api/site-post-permissions?view=graph-rest-1.0
- Descarga autenticada: https://learn.microsoft.com/en-us/graph/api/driveitem-get-content?view=graph-rest-1.0
- Vercel: https://vercel.com/docs/functions y https://vercel.com/docs/rewrites
