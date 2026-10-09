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
3. **Imágenes:** las cuatro ilustraciones están en `assets/img/` (ver `assets/img/CREDITOS.md`). Para sustituirlas por fotografías, cambia el `src` del `<img>` correspondiente en `index.html`, conserva `width`, `height` y un `alt` descriptivo, y respeta los requisitos de privacidad de más abajo. El hueco de «Sobre la profesional» sigue siendo un marcador a la espera de una foto real.
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
- [ ] Completar `<link rel="canonical">`, `og:url` y `og:image` con el dominio definitivo.
- [ ] Desplegar `backend/apps-script/Code.gs`, configurar `formEndpoint` y probar un envío real que llegue al correo del centro.
- [ ] Sustituir las fotografías pendientes.
- [ ] Revisar y adaptar `legal.html` con un profesional jurídico (LOPDGDD, RGPD, LSSI y cookies). Esta página es una base provisional, no asesoramiento legal.
- [ ] Confirmar si se ofrecen consultas online. Hasta entonces, la FAQ correspondiente no lo afirma.
- [ ] Confirmar la ubicación y el horario antes de publicarlos. No se ha inventado ninguno.
- [ ] Revisar accesibilidad con un lector de pantalla y con navegación solo por teclado.
- [ ] Añadir el sitemap y configurar Google Business Profile para la búsqueda local, cuando exista dirección.

## SEO

Cada página tiene `<title>`, meta descripción, Open Graph y una jerarquía de encabezados con un único `h1`. Las palabras clave del brief (orientación familiar, orientación matrimonial, orientación de pareja, mediación familiar, conflictos familiares y comunicación en pareja) aparecen de forma natural en los títulos y textos.

## Imágenes

No se han usado fotografías de personas. La web lleva cuatro **ilustraciones originales en SVG** (familia junto a una ventana, sala acogedora, familia en un olivar y pareja conversando) que usan la paleta del sitio, pesan unos 4 KB cada una y no dependen de terceros. Los personajes no tienen rasgos faciales, para respetar la discreción del servicio.

Si más adelante se quieren fotografías reales:

- Solo con consentimiento escrito de quienes aparezcan, o con licencia verificada; anota la fuente en `assets/img/CREDITOS.md`.
- Máximo 1600 px de lado mayor, formato WebP, menos de 300 KB y sin metadatos EXIF.
- Evita retratos reconocibles de menores y cualquier foto que pueda asociarse a un caso real.

## Banners para redes sociales

Hay tres direcciones de arte en tres formatos, ya exportados en `assets/banners/primera-consulta/`:

| Dirección | Estilo | Tamaños |
| --- | --- | --- |
| `organic` | Natural / orgánica: ramas en salvia y oliva sobre marfil | 1200×630 (compartir en redes), 1080×1080 (Instagram), 820×312 (portada de Facebook) |
| `editorial` | Rejilla con filetes finos y banda lateral oliva | los mismos tres |
| `gradient` | Degradado suave y minimalista, con mucho aire | los mismos tres |

- **Fuente editable:** `assets/banners/source/banner.html`. El texto es HTML real y las formas son CSS/SVG; no hay imágenes externas. Se elige variante con `?style=organic|editorial|gradient&size=og|square|cover`.
- **Regenerar los PNG:** `node scripts/export-banners.js` (requiere `npm i playwright`). Comprueba que cada PNG tenga el tamaño exacto.
- **Reglas aplicadas:** contenido dentro de la zona segura, un solo botón de acción abajo a la derecha (mínimo 44 px), titular de al menos 32 px, texto de al menos 16 px, dos tipografías y contraste superior a 4,5:1.
- **Vista previa al compartir la web:** `index.html` usa `organic-1200x630.png` como `og:image`. Hay que sustituir `[dominio-del-centro]` por el dominio real, porque esa etiqueta necesita una URL absoluta.
- **Pendiente de confirmar:** no hay logo, fotografía ni nombre definitivo del centro, así que los banners usan solo el lema y la descripción de la web. Cuando existan, se añaden en `banner.html`.

## Pruebas de datos extremos

`tests/break-ui.js` carga la web con valores muy largos pero realistas (nombres, correos, direcciones, horarios y redes) y la revisa a 320, 375, 768 y 1440 px, también con el texto ampliado al 200 %. Falla si algo se sale de la pantalla o queda cortado.

```
npm i playwright
node tests/break-ui.js
```

Úsala cada vez que cambies la maqueta o añadas contenido largo en `js/config.js`.

## Criterios de diseño y movimiento

- Curvas de salida fuertes, sin `ease-in`; ninguna animación `keyframes` en elementos que se activan a menudo.
- Interacciones por debajo de 300 ms. Excepciones justificadas: el revelado de la imagen principal (600 ms, es editorial y ocurre una vez) y el desplegado de servicios, que anima la altura con `grid-template-rows`.
- Un solo momento de animación de autor (la entrada de la portada); el resto de la página está quieta.
- La acción principal está disponible en la primera pantalla en su forma de trabajo: un formulario de inicio rápido que pasa los datos al asistente.
- Todos los efectos `:hover` van dentro de `@media (hover: hover) and (pointer: fine)`.
- Respeta `prefers-reduced-motion`.
- Móvil: sin destello al tocar, toque inmediato, zonas seguras del iPhone y teclado adecuado en cada campo.

## Verificación realizada

- Sin desbordamiento horizontal en 375, 820 y 1366 px de ancho.
- Menú móvil: se abre, se cierra con enlace o con Escape, y actualiza `aria-expanded`.
- Formulario: validación de nombre, correo, teléfono, preferencia y privacidad; mensajes de error vinculados por `aria-describedby`; envío correcto y reseteo con endpoint simulado.
- Sin errores de JavaScript en consola en las dos páginas.
- Movimiento: las animaciones usan `transform` y `opacity`, y se desactivan con `prefers-reduced-motion`.
