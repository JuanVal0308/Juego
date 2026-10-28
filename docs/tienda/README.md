# Tienda – Google Play

Material para la ficha de la tienda de NotaFlow (id `com.notaflow.juego`).

| Archivo | Qué es | Estado |
|---------|--------|--------|
| `icono-512.png` | Icono de 512×512, PNG de 32 bits (24 KB) | Listo |
| `grafico-funciones-1024x500.png` | Gráfico de funciones 1024×500 | Listo |
| `capturas-1080x1920/` | 8 capturas de teléfono de 1080×1920 (9:16): splash, inicio, canciones, niveles, juego en curso, resultados, puntajes y créditos | Listas |
| `textos.md` | Nombre, descripción breve y completa, categoría, etiquetas, clasificación de contenido, público objetivo y seguridad de los datos | Listo |
| `../politica-privacidad.md` | Política de privacidad (versión publicada en la web) | Lista |

**Política de privacidad (URL pública):** https://juanval0308.github.io/NotaFlow/politica-privacidad.html

## Cómo regenerar las imágenes

Con `npm run dev` encendido:

```bash
python3 herramientas/capturas_tienda.py     # capturas 1080x1920 desde el juego real (Playwright, escala x3)
python3 herramientas/grafico_funcion.py     # gráfico de funciones 1024x500
```
