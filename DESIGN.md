# Diseño

Sistema visual actual, extraído del código (`css/styles.css`). Si algo cambia en el código, esta página debe actualizarse.

## Mundo visual

Editorial, cálido y mediterráneo: papel marfil, verdes de olivo y un toque de terracota. Mucho aire, filetes finos en lugar de tarjetas y una tipografía serif con carácter. La luz natural y las plantas son el motivo recurrente.

## Color

| Token | Valor | Uso |
| --- | --- | --- |
| `--ivory` | `#FBF8F2` | Fondo principal |
| `--off-white` | `#F5EFE4` | Secciones alternas |
| `--beige` | `#EDE3D3` | Superficies suaves, pie |
| `--sand` | `#E3D6C2` | Filetes y bordes |
| `--sage` | `#8C9B7E` | Acento decorativo |
| `--olive` | `#5C6B4E` | Botones y acentos con texto |
| `--olive-dark` | `#4A5740` | Hover y texto de énfasis |
| `--ink` | `#3A332D` | Texto principal |
| `--taupe` | `#6E6055` | Texto secundario |
| `--error` | `#9A4B3C` | Errores |

Contrastes: texto principal sobre marfil 11,7:1, texto secundario 5,7:1, texto de botón 5,4:1. La terracota (`#C98B6B`) solo aparece en las ilustraciones.

## Tipografía

- **Titulares:** Cormorant Garamond, pesos 500 y 600, cursiva para el énfasis.
- **Texto:** Manrope, pesos 400 a 600.
- Escala fluida con `clamp()`: titular principal hasta 4,9 rem, texto de 1 a 1,06 rem. Medida de lectura de 60 caracteres en los párrafos grandes.

## Forma y espacio

- Radios: 14 px, 24 px y píldora para botones.
- Sin tarjetas: las secciones se separan con filetes de 1 px y espacio vertical generoso (`--section-y`, de 72 a 144 px).
- Sombra suave y con desplazamiento, solo en imágenes y en el formulario.

## Movimiento

- Curva `cubic-bezier(0.23, 1, 0.32, 1)` en todo; nunca `ease-in`.
- **Un solo momento de autor:** la entrada de la portada (texto escalonado y recorte de la imagen). El resto de la página está quieta.
- Interacciones por debajo de 300 ms; abrir más despacio que cerrar.
- Todos los `:hover` dentro de `@media (hover: hover) and (pointer: fine)`. Respeta `prefers-reduced-motion`.

## Componentes

- **Inicio rápido (portada):** dos campos y el botón principal; pasa los datos al asistente.
- **Servicios:** lista con filetes; cada fila se despliega con «Más información» y ofrece «Solicitar consulta».
- **Asistente de solicitud:** tres pasos con barra de progreso y opciones en fichas.
- **Preguntas frecuentes:** `details` con chevron dibujado.

## Imágenes

Ilustraciones originales en SVG (`assets/img/`), sin rasgos faciales, con la misma paleta. Ver `assets/img/CREDITOS.md`.

## Superficies del navegador

Selección de texto, cursor, barra de desplazamiento y controles nativos están teñidos con la paleta (`::selection`, `caret-color`, `scrollbar-color`, `accent-color`).

## Lo que se evita a propósito

Etiquetas pequeñas sobre los títulos, tarjetas iguales de icono + título + texto, numeración decorativa, bordes laterales de color, texto con degradado, glifos de texto como iconos, y la misma animación de entrada repetida en cada sección.
