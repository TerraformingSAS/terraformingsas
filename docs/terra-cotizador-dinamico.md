# Cotizador dinámico

Rutas: `/terra/cotizador-dinamico` y `/terra/cotizador-dinamico/parametros` (administrador).
Comparte la sesión y la lectura de lotes con el cotizador fijo. No modifica su motor, parámetros, registros ni servicios de envío. Un selector de modalidad se agrega a la navegación compartida.

## Reglas

- Precio y disponibilidad: Excel/SharePoint existente, verificados de nuevo al generar. La separación del Excel no limita el dinámico; se valida el mínimo propio.
- Separación mínima inicial: $5.000.000. Tasa inicial: 1% mensual vencido. Cuota inicial sugerida: $1.000.000. Plazo inicial: 24 meses. Todos configurables por administrador, máximo técnico de 360 meses.
- El porcentaje (70% o 100%) se aplica después de restar la separación. En 70%, el 30% restante se reserva **sin intereses** hasta la entrega. Esto es una condición explícita de esta implementación, pendiente de ratificación comercial.
- La primera mensualidad vence un mes después de separar. Se conserva el día de la separación, ajustado al último día del mes si hace falta. Si la separación fue a fin de mes, todos los vencimientos son a fin de mes.
- Interés = saldo financiado inicial del período × tasa. Después se aplica mensualidad y abonos. Intereses no cubiertos se incorporan al saldo. Sin redondeo intermedio; presentación al peso.
- Varios abonos por mensualidad, con valor y concepto, editables y eliminables. Al exceder la deuda, se aplica solo lo necesario después de la mensualidad. La tabla y el reporte distinguen abono solicitado y aplicado.
- Cancelación anticipada de la parte financiada: ajustar el pago al saldo y conservar los N períodos posteriores con cuota/interés $0. El 30% reservado se mantiene hasta la entrega.
- Entrega: igual o posterior al último vencimiento. Por defecto coincide con ese vencimiento. Si es posterior, el asesor debe dejar explícita la condición «intereses hasta entrega» (activada por defecto): meses completos capitalizados y fracción efectiva `(1 + tasa)^(días / días del período) - 1`. Desactivada, congela el saldo después de la última mensualidad. La condición queda en el reporte. Se expone esta decisión porque no estaba cerrada en el levantamiento.
- Pago final adicional = saldo financiado remanente + 30% reservado, cuando aplica. Total = separación + cuotas aplicadas + abonos aplicados + pago final.
- La cuota de equilibrio cancela **solo la parte financiada** en N meses, sin abonos. En 70% no elimina la reserva del 30%.

## Reportes y persistencia

La API recalcula el plan con precio y tasa del servidor. Rechaza cambios de precio/parámetros con HTTP 409 para exigir una revisión antes de emitir. Guarda una copia inmutable con cliente, asesor, precio, parámetros, condiciones, abonos, filas y datos comerciales.

- Redis `terra:cotizador-dinamico:parametros`: configuración independiente; GET usa defaults si no hay clave, sin escribir ni sembrar parámetros del cotizador fijo.
- Redis `terra:cotizador-dinamico:cotizacion:{uuid}`: cada cotización en su propia clave, sin sobreescribir historiales existentes ni límite de 2.000 registros.
- Los registros no tienen caducidad automática. La retención debe definirse operativamente según las políticas existentes.
- El enlace guardado exige sesión del mismo asesor o administrador. Al editar se emite una cotización nueva con parámetros y precio vigentes.
- Impresión / guardar PDF: reporte multipágina, con encabezado de tabla repetido, período 0, N mensualidades, espera si aplica y pago final. No envía correos automáticamente.
- «Enviar a mercadeo»: acción explícita sobre la copia guardada, con el calendario en el correo. Reutiliza Graph y `MAIL_SENDER`, sin modificar el envío del cotizador fijo.

API:

| Ruta                                   | Métodos               | Permiso                              |
| -------------------------------------- | --------------------- | ------------------------------------ |
| `/api/cotizador-dinamico/parametros`   | GET / PUT             | Sesión / administrador               |
| `/api/cotizador-dinamico/cotizaciones` | POST / GET `?id=uuid` | Sesión / propietario o administrador |
| `/api/cotizador-dinamico/enviar`       | POST `{ id }`         | Propietario o administrador          |

Mismas variables de sesión, Redis, Graph y Excel del proyecto; no se agregan credenciales ni dependencias.

## Caso de aceptación aportado por el usuario

Precio $126.626.500; separación $5.000.000; 100%; 24 mensualidades de $1.000.000; tasa 1%; separación 2026-11-30; entrega 2028-11-30. Intereses $29.833.416; pago final adicional $127.459.916; total $156.459.916; cuota de equilibrio $5.725.382. Importes presentados redondeados al peso.

Abono $10.000.000 al cierre del mes 12: pago final $116.191.666; ahorro de intereses $1.268.250.

## Verificación

`npm run terra:test` incluye los cálculos de ambos cotizadores y las pruebas del servidor dinámico con sesión, Redis y Excel simulados: permisos, persistencia, discrepancias y recálculo confiable. `npm run build` regenera las rutas. No se deben probar correos ni modificar datos comerciales reales durante la revisión.

Validación de esta implementación (14 nov 2026):

- Compilación de producción y prueba del servidor compilado: correctas.
- Suite completa: 60 pruebas correctas, 20 correspondientes al dinámico.
- ESLint de todos los archivos nuevos y del encabezado modificado: sin errores ni advertencias.
- Navegador con servicios simulados: caso de referencia, abono en mes 12, edición, eliminación, generación, reapertura, parámetros y anchos de 320/1280 px. Sin errores de consola observados. El formulario dinámico no desborda horizontalmente a 320 px; la grilla tiene desplazamiento local.
- TypeScript global: conserva los mismos errores de la revisión base `fe1580a` en archivos existentes; no añade errores. Se contrastó con una copia sin los cambios de esta propuesta.
- Verificación del visor: el checkout Windows introduce CRLF y hace fallar las huellas binarias. Las huellas coinciden con los originales al normalizar LF, y los verificadores pasan en la copia de referencia normalizada. No se modificaron archivos del visor.
- La conexión a SharePoint/Redis y el envío de correo reales requieren verificación en el ambiente de revisión con las variables ya usadas por el proyecto. No se ejecutaron envíos reales ni se confirmó una impresión PDF desde el diálogo del sistema.
