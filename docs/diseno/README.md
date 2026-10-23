# Diseño – Wireframes de NotaFlow

Esta carpeta reúne los **wireframes** de la entrega: primero se dibujaron a mano (estilo lápiz sobre papel) y luego se
pasaron a **Figma**, totalmente editables y en escala de grises.

## 1. Bocetos en papel (`papel/`)

Son **bocetos de lápiz digital**: trazos temblorosos, rayado y fondo cuadriculado, como si estuvieran hechos a mano
en un cuaderno. Se dejaron en dos formatos:

- **Hojas completas** (A4 horizontal, varias pantallas por hoja):
  - `papel/hoja-1-splash-inicio-canciones-niveles.png`
  - `papel/hoja-2-juego-pausa-resultados.png`
  - `papel/hoja-3-puntajes-creditos-ajustes.png`
  - `papel/hoja-4-flujo-navegacion.png`
- **Pantallas individuales**: `papel/individuales/01-splash.png` … `10-ajustes.png`.

## 2. Wireframes en Figma (editables)

**Enlace:** <https://www.figma.com/design/0YzDwMdLt5DerDbry2Su1Z/NotaFlow---Wireframes>

- **12 frames** en una sola fila: el flujo de navegación, las 10 pantallas y el sistema de diseño.
- **Escala de grises**, en capas vectoriales y con textos editables (sin prototipo ni pantallas clicables).
- Los mismos frames están aquí como archivos: `figma-svg/` (vectores, se pueden importar a Figma arrastrándolos)
  y `figma-png/` (vistas previas de 720×1600).

## 3. Lista de pantallas

| # | Pantalla | SVG / PNG | Boceto en papel |
|---|----------|-----------|-----------------|
| 0 | Flujo de navegación | `00-flujo` | hoja 4 |
| 1 | Splash | `01-splash` | `individuales/01-splash.png` |
| 2 | Inicio (Jugar, Puntajes, Créditos, ajustes rápidos) | `02-home` | `individuales/02-home.png` |
| 3 | Selección de canción | `03-seleccion-cancion` | `individuales/03-seleccion-cancion.png` |
| 4 | Selección de nivel | `04-seleccion-nivel` | `individuales/04-seleccion-nivel.png` |
| 5 | Juego (carriles, puntaje, combo, vida, pausa) | `05-juego` | `individuales/05-juego.png` |
| 6 | Pausa | `06-pausa` | `individuales/06-pausa.png` |
| 7 | Resultados | `07-resultados` | `individuales/07-resultados.png` |
| 8 | Puntajes | `08-puntajes` | `individuales/08-puntajes.png` |
| 9 | Créditos | `09-creditos` | `individuales/09-creditos.png` |
| 10 | Ajustes | `10-ajustes` | `individuales/10-ajustes.png` |
| 11 | Sistema de diseño (colores, tipografías, botones) | `11-sistema-diseno` | — |

Como referencia del resultado final, ver las capturas del juego real en [`../capturas/`](../capturas/).
