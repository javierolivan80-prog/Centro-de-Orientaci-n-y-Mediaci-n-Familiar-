# Diseño

Sistema visual actual, extraído del código (`css/styles.css`). Si algo cambia en el código, esta página debe actualizarse.

## Mundo visual: «la luz del día»

Una página que amanece contigo: crema y papel claros, un sol que sale, verdes de olivar y una arcilla cálida para la acción. Los marcos de las imágenes son arcos de ventana. Las secciones alternan claras y oscuras (pino profundo) para dar ritmo. Motivo recurrente: dos círculos que se solapan, «dos voces que se encuentran» (logomarca y banda animada de «Cómo trabajamos»).

## Color

| Token | Valor | Uso |
| --- | --- | --- |
| `--paper` | `#FFFCF5` | Fondo principal |
| `--cream` | `#FBF1DD` | Portada y secciones cálidas |
| `--butter` | `#F7E3B8` | Superficies suaves |
| `--mint` | `#E7F3EA` | Sección de servicios |
| `--sun` | `#F7C65B` | Sol, cita, numeración, subrayado |
| `--apricot` | `#F4A261` | Ilustraciones |
| `--clay` | `#B94A2C` | Acción principal (botones) |
| `--clay-dark` | `#9A3B21` | Hover del botón |
| `--leaf` | `#2A7550` | Enlaces y acentos |
| `--pine` | `#123D2E` | Titulares y secciones oscuras |
| `--pine-deep` | `#0C2B21` | Pie de página |
| `--ink` | `#1E2A24` | Texto principal |
| `--muted` | `#4F5F55` | Texto secundario |
| `--on-dark` / `--on-dark-muted` | `#FFF6E3` / `#CFE1D6` | Texto sobre pino |

Contrastes: texto principal sobre papel 14,5:1; texto secundario 6,6:1; blanco sobre arcilla 5,2:1; texto claro sobre pino 11,3:1; arcilla sobre crema 4,6:1 (el más bajo).

## Tipografía

- **Titulares:** Fraunces (variable, eje SOFT al máximo), pesos 500 a 560; cursiva para el énfasis.
- **Texto:** Figtree, pesos 400 a 700.
- Escala fluida con `clamp()`: titular principal hasta 4,6 rem. Medida de lectura de 60 caracteres en los párrafos grandes.

## Forma y espacio

- Radios: 16 px, 28 px, arco (`999px` arriba) y píldora para botones.
- Filetes de 2 a 3 px en color pino para separar; sin tarjetas iguales.
- Sombra suave con desplazamiento solo en imágenes y formulario.
- Espacio vertical generoso (`--section-y`, de 72 a 144 px).

## Movimiento

- Curva `cubic-bezier(0.23, 1, 0.32, 1)` y `cubic-bezier(0.77, 0, 0.175, 1)` para recortes; nunca `ease-in`.
- Entradas por tipo: titulares por palabras, imágenes por recorte, listas en cascada, portada con sol que sale y subrayado que se dibuja.
- Ilustraciones animadas dentro del SVG (vapor, hojas, nubes, luz).
- «Dos voces»: los círculos se acercan al bajar, controlado por scroll solo con `transform`.
- Interacciones de 150 a 220 ms; abrir más despacio que cerrar.
- `:hover` solo con ratón. `prefers-reduced-motion`: sin bucles ni desplazamientos, todo visible.

## Componentes

- **Inicio rápido (portada):** dos campos y el botón principal; pasa los datos al asistente.
- **Servicios:** lista con filetes; cada fila se despliega con «Más información» y ofrece «Solicitar consulta».
- **Asistente de solicitud:** tres pasos con barra de progreso, opciones en fichas y confirmación.
- **Preguntas frecuentes:** `details` con chevron dibujado.

## Imágenes

Ilustraciones originales en SVG con la misma paleta, animadas desde dentro (`assets/img/`). Sin rasgos faciales. Ver `assets/img/CREDITOS.md`.

## Superficies del navegador

Selección de texto (sol), cursor (arcilla), barra de desplazamiento y controles nativos teñidos con la paleta.

## Lo que se evita a propósito

Etiquetas pequeñas sobre los títulos, tarjetas iguales de icono + título + texto, numeración decorativa, bordes laterales de color, texto con degradado, glifos de texto como iconos, desenfoque decorativo, y la misma animación repetida en cada sección.
