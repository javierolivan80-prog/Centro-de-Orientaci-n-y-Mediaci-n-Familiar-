# Web del Centro de Orientación y Mediación Familiar

Sitio estático (HTML, CSS y JavaScript sin compilar). Puede publicarse en cualquier hosting que sirva archivos estáticos.

## Estructura

```
index.html          Página principal (hero, centro, servicios, filosofía, profesional, proceso, FAQ, contacto)
legal.html          Aviso legal, privacidad, cookies y accesibilidad (provisional)
css/styles.css      Estilos: tokens de color y tipografía en :root, responsive y movimiento reducido
js/config.js        DATOS EDITABLES: nombre del centro, contacto, fundadora, redes y endpoint del formulario
js/main.js          Comportamiento: menú móvil, revelado al hacer scroll, validación y envío del formulario
```

## Cómo editar

1. **Datos del centro y de la fundadora:** abre `js/config.js` y sustituye los valores entre corchetes.
2. **Textos de cada sección:** están directamente en `index.html`.
3. **Fotografías:** los bloques con la etiqueta "Fotografía pendiente" son marcadores. Para usar una foto real, sustituye el `<div class="photo-frame">` por `<img>` con `alt` descriptivo, y mantén `aspect-ratio` en `.photo-frame` si quieres conservar el formato.
4. **Colores y tipografías:** variables en `:root` de `css/styles.css`.

## Formulario de contacto (asistente de tres pasos)

El formulario recoge los datos en tres pasos: quién eres, qué te gustaría trabajar y cómo prefieres que te contactemos. Valida cada paso, muestra errores accesibles y confirma el envío. Los botones «Solicitar consulta» de cada servicio preseleccionan el motivo.

Para que las solicitudes lleguen a tu correo:

1. Abre `backend/apps-script/Code.gs` y sigue las instrucciones de la cabecera (proyecto de Google Apps Script, `NOTIFY_EMAIL`, implementación como aplicación web).
2. Copia la URL que termina en `/exec` y pégala en `formEndpoint` de `js/config.js`.
3. Haz un envío de prueba desde la web y comprueba que llega el correo. Si pulsas «Responder», escribirás directamente a la persona.
4. Opcional: crea una hoja de cálculo, copia su ID en `SHEET_ID` y cada solicitud quedará también registrada allí.

Notas:

- Si `formEndpoint` está vacío, el formulario **no envía nada** y pide a la persona que llame o escriba. No muestra una confirmación falsa.
- Cada cambio en `Code.gs` requiere una **nueva versión** de la implementación (Implementar > Gestionar implementaciones), o seguirá funcionando la versión anterior.
- La comunicación con Apps Script se hace con `text/plain` para evitar una comprobación previa que Apps Script no admite. Confirma el primer envío de prueba, porque depende del comportamiento actual de Google.
- El campo oculto «No rellenar» descarta los envíos de robots.

## Antes de publicar

- [ ] Sustituir todos los valores entre corchetes (en `index.html`, `legal.html` y `js/config.js`).
- [ ] Completar `<link rel="canonical">` y `og:url` con el dominio definitivo.
- [ ] Desplegar `backend/apps-script/Code.gs`, configurar `formEndpoint` y probar un envío real que llegue al correo del centro.
- [ ] Sustituir las fotografías pendientes.
- [ ] Revisar y adaptar `legal.html` con un profesional jurídico (LOPDGDD, RGPD, LSSI y cookies). Esta página es una base provisional, no asesoramiento legal.
- [ ] Confirmar si se ofrecen consultas online. Hasta entonces, la FAQ correspondiente no lo afirma.
- [ ] Confirmar la ubicación y el horario antes de publicarlos. No se ha inventado ninguno.
- [ ] Revisar accesibilidad con un lector de pantalla y con navegación solo por teclado.
- [ ] Añadir el sitemap y configurar Google Business Profile para la búsqueda local, cuando exista dirección.

## SEO

Cada página tiene `<title>`, meta descripción, Open Graph y una jerarquía de encabezados con un único `h1`. Las palabras clave del brief (orientación familiar, orientación matrimonial, orientación de pareja, mediación familiar, conflictos familiares y comunicación en pareja) aparecen de forma natural en los títulos y textos.

## Verificación realizada

- Sin desbordamiento horizontal en 375, 820 y 1366 px de ancho.
- Menú móvil: se abre, se cierra con enlace o con Escape, y actualiza `aria-expanded`.
- Formulario: validación de nombre, correo, teléfono, preferencia y privacidad; mensajes de error vinculados por `aria-describedby`; envío correcto y reseteo con endpoint simulado.
- Sin errores de JavaScript en consola en las dos páginas.
- Movimiento: las animaciones usan `transform` y `opacity`, y se desactivan con `prefers-reduced-motion`.
