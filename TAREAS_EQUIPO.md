# Tareas del equipo – NotaFlow

Requisito de la entrega: **cada integrante debe tener mínimo 15 commits** en el repositorio.
Aquí hay dos listas de tareas **sencillas pero reales**, pensadas para hacerse en pasos pequeños (un paso = un commit).
Juan Pablo ya hizo la parte más compleja (motor del juego, audio, interfaz y Android).

En el código hay marcadores `TODO(equipo)` que indican dónde trabajar. Para verlos todos:

```bash
grep -rn "TODO(equipo)" src
```

## 0. Preparación (todos)

```bash
git clone https://github.com/JuanVal0308/NotaFlow.git
cd NotaFlow
npm install
npm run dev          # abre http://localhost:5173 (usa Ctrl+Shift+M en Chrome para vista de celular)
```

- Configura **tu propio** nombre y correo (los commits deben salir con tu usuario):
  ```bash
  git config user.name "Tu Nombre"
  git config user.email "tu-correo@ejemplo.com"
  ```
- Antes de empezar cada día: `git pull`.
- Después de cada paso pequeño: probar en el navegador, y luego
  ```bash
  git add -A
  git commit -m "Mensaje corto en español que diga qué cambiaste"
  git push
  ```
- Reglas: commits **pequeños** (un cambio por commit), mensajes en **español**, comentarios en español en el código nuevo.
  Si trabajas en la misma rama que otro compañero haz `git pull` antes de `git push`.
- Si algo se rompe: `npm run build` debe terminar sin errores antes de subir.
- Si usas IA para ayudarte, anótalo en el commit o en el README (la entrega pide justificarlo) y asegúrate de entender el código.

---

## Integrante 2 – Canciones, niveles y textos

**Archivos principales:** `src/canciones/`, `src/niveles.js`, `src/pantallas/ayuda.js`, `src/pantallas/creditos.js`, `src/pantallas/home.js`.

Cómo se escribe una melodía (ver `src/canciones/estrellita.js` y `notacion.js`): cada nota es `NOTA:DURACIÓN`,
por ejemplo `C4 D4 E4:2 -:1` = Do, Re, Mi (2 pulsos) y un silencio. `C=Do D=Re E=Mi F=Fa G=Sol A=La B=Si`.

### A. Dos canciones nuevas (usa melodías de dominio público, por ejemplo "Hermano Juan" (Frère Jacques), "Oh! Susanna", "Greensleeves" o "Marcha Turca" de Mozart; evita canciones modernas con derechos de autor)

- [ ] 1. Crea `src/canciones/cancion-nueva-1.js` copiando `estrellita.js` y cambia `id`, `titulo`, `artista`, `descripcion`. *(commit: "Crear archivo de la canción 5")*
- [ ] 2. Escribe la primera frase de la melodía en la notación de texto. *(commit)*
- [ ] 3. Completa el resto de la melodía (usa `unir(A, B, A)` para repetir partes). *(commit)*
- [ ] 4. Elige `bpm`, `instrumento` (`piano`, `guitarra` o `sinte`), `ritmo` y `color`. *(commit)*
- [ ] 5. Escribe el `bajo` (notas graves `C3`, `G2`...). Debe durar lo mismo que la melodía. *(commit)*
- [ ] 6. Regístrala en `src/canciones/index.js` (marcador `TODO(equipo)`) y pruébala en los 3 niveles. *(commit)*
- [ ] 7. Repite los pasos 1–6 para la **canción 2** (puedes dividirlo en commits más pequeños: archivo, melodía, bajo, registro). *(varios commits)*

### B. Afinar los niveles

- [ ] 8. Juega los 3 niveles de una canción y anota qué se siente muy fácil o muy difícil. *(commit: notas en `docs/pruebas-niveles.md`)*
- [ ] 9. En `src/niveles.js` ajusta `tiempoCaidaMs` de Fácil. *(commit)*
- [ ] 10. Ajusta `ventanaPerfectoMs` y `ventanaBienMs` de Medio. *(commit)*
- [ ] 11. Ajusta `danoFallo` y `probAcorde` de Difícil. *(commit)*
- [ ] 12. Explica en un comentario de `niveles.js` por qué elegiste esos valores. *(commit)*

### C. Textos y créditos

- [ ] 13. Reescribe los pasos de "Cómo jugar" en `src/pantallas/ayuda.js` con tus palabras (más claros y cortos). *(commit)*
- [ ] 14. Agrega un paso nuevo que explique los multiplicadores de combo. *(commit)*
- [ ] 15. En `src/pantallas/creditos.js` cambia "Integrante 2" por tu nombre real y tu rol. *(commit)*
- [ ] 16. Corrige la descripción de cada canción en su archivo (`descripcion`). *(commit)*

### D. Easter eggs (bonus del curso)

- [ ] 17. Easter egg #4 en `src/pantallas/home.js` (marcador `TODO(equipo)`): por ejemplo, tocar 5 veces el contador de estrellas muestra un aviso con `aviso('...')`. *(commit)*
- [ ] 18. Que ese easter egg suene y vibre (`sonidoSecreto()`, `vibrar('victoria')`). *(commit)*
- [ ] 19. Easter egg #5 en `src/pantallas/resultados.js`: un mensaje especial si el puntaje termina en `777`. *(commit)*
- [ ] 20. Documenta los nuevos easter eggs en el README (sección "Easter eggs"). *(commit)*

> Total: más de 20 pasos. Con 15 ya cumples el mínimo, pero mientras más pequeños los commits, mejor.

---

## Integrante 3 – Sonido, documentación, tema y tienda

**Archivos principales:** `src/audio.js`, `src/pantallas/ajustes.js`, `src/estilos/base.css`, `README.md`, `docs/`.

### A. Efectos de sonido (marcador `TODO(equipo)` en `src/audio.js`)

- [ ] 1. Lee `sonidoClic()` y `sonidoAcierto()` y cambia la frecuencia de `sonidoClic` para que suene distinto. *(commit)*
- [ ] 2. Crea `sonidoAciertoB()` (otro tono de acierto) copiando `sonidoAcierto`. *(commit)*
- [ ] 3. Haz que el acierto alterne entre los dos sonidos. *(commit)*
- [ ] 4. Cambia `sonidoFallo()` para que sea más grave o más corto. *(commit)*
- [ ] 5. Agrega un sonido nuevo al abrir "Ajustes" (usa `voz({...})` como los demás). *(commit)*

### B. Tema de color (marcadores en `base.css` y `ajustes.js`)

- [ ] 6. En `src/estilos/base.css` crea el tema alternativo: `:root[data-tema="solar"] { --cian: ...; --magenta: ...; }` (colores naranja/amarillo). *(commit)*
- [ ] 7. En `src/pantallas/ajustes.js` agrega el botón "Tema de color" (el ajuste `tema` ya existe en `almacenamiento.js`). *(commit)*
- [ ] 8. Al cambiarlo, guarda con `cambiarAjuste('tema', 'solar')` y aplica `document.documentElement.dataset.tema`. *(commit)*
- [ ] 9. En `src/main.js` aplica el tema guardado al iniciar la app para que persista. *(commit)*
- [ ] 10. Toma capturas de ambos temas y guárdalas en `docs/capturas/`. *(commit)*

### C. Documentación

- [ ] 11. Crea `docs/manual-usuario.md` con una sección por pantalla (usa las capturas de `docs/capturas/`). *(commit por cada 2–3 pantallas)*
- [ ] 12. Revisa la ortografía del `README.md` y mejora la sección "Cómo jugar". *(commit)*
- [ ] 13. Agrega al README una sección "Preguntas frecuentes". *(commit)*
- [ ] 14. Coloca en `docs/diseno/` los wireframes en papel (fotos) y el enlace al Figma, y actualiza `docs/diseno/README.md`. *(commit)*

### D. Tienda (Google Play) y pruebas

- [ ] 15. Escribe en `docs/tienda/titulo-y-descripcion.md` el título (máx. 30 caracteres), descripción corta (máx. 80) y descripción larga. *(commit)*
- [ ] 16. Escribe en `docs/tienda/politica-privacidad.md` una política simple (la app no recoge datos personales; guarda el puntaje en el celular). *(commit)*
- [ ] 17. Elige 4–8 capturas para la tienda y cópialas a `docs/tienda/capturas/`. *(commit)*
- [ ] 18. Instala el APK de prueba en un celular real (`android/app/build/outputs/apk/debug/app-debug.apk`) y prueba todas las pantallas. *(commit: `docs/pruebas-celular.md` con modelo de celular y resultados)*
- [ ] 19. Crea un "issue" en GitHub por cada error que encuentres (título claro + pasos para repetirlo). *(sin commit, pero cuenta como participación)*
- [ ] 20. Corrige un error sencillo de los que encontraste y súbelo con un commit que mencione el issue. *(commit)*

> Total: más de 20 pasos. Con 15 ya cumples el mínimo.

---

## Juan Pablo – ya hecho / pendiente

- Hecho: motor del juego, audio, pantallas, persistencia, easter eggs #1–#3, pruebas automáticas, proyecto Android, iconos.
- Pendiente: firmar y subir la app a Google Play (cuando el equipo termine las tareas), revisar los pull requests y unir el trabajo.

## Ayuda rápida

| Quiero... | Mira |
|-----------|------|
| Cambiar un texto de una pantalla | `src/pantallas/<pantalla>.js` |
| Cambiar colores | `src/estilos/base.css` (variables `--cian`, `--magenta`...) |
| Agregar una canción | `src/canciones/` + `index.js` |
| Cambiar la dificultad | `src/niveles.js` |
| Probar todo automáticamente | `python3 pruebas/e2e.py` (con `npm run dev` activo) |
