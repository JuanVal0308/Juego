# Tareas del equipo – NotaFlow

Requisito de la entrega: **cada integrante debe tener mínimo 10 commits** en el repositorio.
Aquí hay tres listas de tareas **sencillas pero reales**, pensadas para hacerse en pasos pequeños (un paso = un commit).
Juan Pablo ya hizo la parte más compleja (motor del juego, audio, interfaz y Android).

Los integrantes son:
- **Juan Pablo Martinez Romero**: Motor del juego, audio, interfaz, Android (trabajo principal completado).
- **Mariana**: Canciones, niveles y textos.
- **Steve**: Efectos de sonido, tema de color y documentación técnica.
- **Pablo**: Manual de usuario, textos de la tienda y pruebas en celular.

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

## Mariana – Canciones, niveles y textos

**Archivos principales:** `src/canciones/`, `src/niveles.js`, `src/pantallas/ayuda.js`, `src/pantallas/creditos.js`, `src/pantallas/home.js`, `src/pantallas/resultados.js`.

Cómo se escribe una melodía (ver `src/canciones/estrellita.js` y `notacion.js`): cada nota es `NOTA:DURACIÓN`,
por ejemplo `C4 D4 E4:2 -:1` = Do, Re, Mi (2 pulsos) y un silencio. `C=Do D=Re E=Mi F=Fa G=Sol A=La B=Si`.

### A. Canciones nuevas (usa melodías de dominio público: "Hermano Juan", "Oh! Susanna", "Greensleeves", "Marcha Turca" de Mozart; evita canciones modernas con derechos de autor)

- [ ] 1. Crea `src/canciones/hermano-juan.js` copiando `estrellita.js` y cambia `id`, `titulo`, `artista`, `descripcion`. *(commit: "Crear archivo para canción Hermano Juan")*
- [ ] 2. Escribe la primera frase de la melodía en la notación de texto. *(commit: "Agregar primera frase de Hermano Juan")*
- [ ] 3. Completa el resto de la melodía (usa `unir(A, B, A)` para repetir partes). *(commit: "Completar melodía de Hermano Juan")*
- [ ] 4. Elige `bpm`, `instrumento` (`piano`, `guitarra` o `sinte`), `ritmo` y `color`. *(commit: "Ajustar tempo e instrumento de Hermano Juan")*
- [ ] 5. Escribe el `bajo` (notas graves `C3`, `G2`...). Debe durar lo mismo que la melodía. *(commit: "Agregar línea de bajo a Hermano Juan")*
- [ ] 6. Regístrala en `src/canciones/index.js` (marcador `TODO(equipo)`) y pruébala en los 3 niveles. *(commit: "Registrar Hermano Juan en el índice de canciones")*
- [ ] 7. Crea `src/canciones/marcha-turca.js` con el mismo proceso (archivo, melodía, bajo). *(commit: "Crear archivo para canción Marcha Turca")*
- [ ] 8. Completa melodía de Marcha Turca. *(commit: "Completar melodía de Marcha Turca")*
- [ ] 9. Agregar bajo a Marcha Turca. *(commit: "Agregar línea de bajo a Marcha Turca")*
- [ ] 10. Registrar Marcha Turca en el índice y probar. *(commit: "Registrar Marcha Turca en el índice de canciones")*

### B. Afinar los niveles

- [ ] 11. Juega los 3 niveles de una canción y anota qué se siente muy fácil o muy difícil. *(commit: crear `docs/pruebas-niveles.md` con notas)*
- [ ] 12. En `src/niveles.js` ajusta `tiempoCaidaMs` de nivel Fácil. *(commit: "Ajustar tiempo de caída en nivel Fácil")*
- [ ] 13. Ajusta `ventanaPerfectoMs` y `ventanaBienMs` de nivel Medio. *(commit: "Ajustar ventanas de acierto en nivel Medio")*
- [ ] 14. Ajusta `danoFallo` y `probAcorde` de nivel Difícil. *(commit: "Ajustar daño y acordes en nivel Difícil")*
- [ ] 15. Explica en un comentario de `niveles.js` por qué elegiste esos valores. *(commit: "Documentar cambios de dificultad")*

### C. Textos y créditos

- [ ] 16. Reescribe los pasos de "Cómo jugar" en `src/pantallas/ayuda.js` con tus palabras (más claros y cortos). *(commit: "Mejorar textos de Cómo jugar")*
- [ ] 17. Agrega un paso nuevo que explique los multiplicadores de combo. *(commit: "Agregar explicación de multiplicadores de combo")*
- [ ] 18. Corrige la descripción de cada canción en su archivo (`descripcion`). *(commit: "Corregir descripciones de canciones")*

### D. Easter eggs

- [ ] 19. Easter egg #4 en `src/pantallas/home.js` (marcador `TODO(equipo)`): por ejemplo, tocar 5 veces el contador de estrellas muestra un aviso con `aviso('...')`. *(commit: "Implementar easter egg en contador de estrellas")*
- [ ] 20. Que ese easter egg suene y vibre (`sonidoSecreto()`, `vibrar('victoria')`). *(commit: "Agregar sonido y vibración al easter egg")*
- [ ] 21. Easter egg #5 en `src/pantallas/resultados.js`: un mensaje especial si el puntaje termina en `777`. *(commit: "Implementar easter egg del puntaje 777")*
- [ ] 22. Documenta los nuevos easter eggs en el README (sección "Easter eggs"). *(commit: "Documentar nuevos easter eggs en README")*

> Total: 22 pasos. Con 10 ya cumples el mínimo. Puedes dividir algunos pasos grandes en commits más pequeños.

---

## Steve – Sonido, tema de color y documentación técnica

**Archivos principales:** `src/audio.js`, `src/pantallas/ajustes.js`, `src/estilos/base.css`, `src/main.js`, `README.md`, `docs/`.

### A. Efectos de sonido (marcador `TODO(equipo)` en `src/audio.js`)

- [ ] 1. Lee `sonidoClic()` y `sonidoAcierto()` y cambia la frecuencia de `sonidoClic` para que suene distinto. *(commit: "Cambiar frecuencia del sonido de clic")*
- [ ] 2. Crea `sonidoAciertoB()` (otro tono de acierto) copiando `sonidoAcierto`. *(commit: "Crear sonido alternativo de acierto")*
- [ ] 3. Haz que el acierto alterne entre los dos sonidos. *(commit: "Alternar entre dos sonidos de acierto")*
- [ ] 4. Cambia `sonidoFallo()` para que sea más grave o más corto. *(commit: "Ajustar sonido de fallo")*
- [ ] 5. Agrega un sonido nuevo al abrir "Ajustes" (usa `voz({...})` como los demás). *(commit: "Agregar sonido al abrir Ajustes")*

### B. Tema de color alternativo (marcadores en `base.css` y `ajustes.js`)

- [ ] 6. En `src/estilos/base.css` crea el tema alternativo: `:root[data-tema="solar"] { --cian: #ff8c00; --magenta: #ffd700; }` (colores naranja/amarillo). *(commit: "Crear tema de color solar")*
- [ ] 7. En `src/pantallas/ajustes.js` agrega el botón "Tema de color" (el ajuste `tema` ya existe en `almacenamiento.js`). *(commit: "Agregar botón de cambio de tema en Ajustes")*
- [ ] 8. Al cambiarlo, guarda con `cambiarAjuste('tema', 'solar')` y aplica `document.documentElement.dataset.tema`. *(commit: "Implementar cambio de tema con persistencia")*
- [ ] 9. En `src/main.js` aplica el tema guardado al iniciar la app para que persista. *(commit: "Aplicar tema guardado al iniciar la app")*
- [ ] 10. Toma capturas de ambos temas y guárdalas en `docs/capturas/`. *(commit: "Agregar capturas de ambos temas")*

### C. Documentación técnica

- [ ] 11. Crea `docs/manual-usuario.md` con sección para Splash, Inicio y Ajustes (usa capturas de `docs/capturas/`). *(commit: "Crear manual de usuario parte 1")*
- [ ] 12. Agrega secciones para Cómo jugar, Selección de canción y nivel. *(commit: "Agregar al manual parte 2")*
- [ ] 13. Agrega secciones para Juego, Pausa, Resultados, Puntajes y Créditos. *(commit: "Completar manual de usuario")*
- [ ] 14. Revisa la ortografía del `README.md` y mejora la sección "Cómo jugar". *(commit: "Mejorar ortografía y claridad del README")*
- [ ] 15. Agrega al README una sección "Preguntas frecuentes" con 5 preguntas comunes. *(commit: "Agregar sección de preguntas frecuentes")*

> Total: 15 pasos. Con 10 ya cumples el mínimo.

---

## Pablo – Manual de usuario, tienda y pruebas en celular

**Archivos principales:** `docs/tienda/`, `docs/pruebas-celular.md`.

### A. Textos de la tienda (Google Play)

- [ ] 1. Crea `docs/tienda/titulo-y-descripcion.md` y escribe el título (máx. 30 caracteres). *(commit: "Escribir título para Google Play")*
- [ ] 2. Escribe la descripción corta (máx. 80 caracteres). *(commit: "Escribir descripción corta")*
- [ ] 3. Escribe la descripción larga (destacando características, música, niveles). *(commit: "Escribir descripción larga para la tienda")*
- [ ] 4. Crea `docs/tienda/politica-privacidad.md` explicando que la app no recoge datos personales (guarda todo en el celular). *(commit: "Escribir política de privacidad")*
- [ ] 5. Selecciona 6 capturas de `docs/capturas/` para la tienda y cópialas a `docs/tienda/capturas/`. *(commit: "Seleccionar capturas para la tienda")*
- [ ] 6. Escribe en `docs/tienda/capturas/notas.md` qué muestra cada captura. *(commit: "Documentar capturas de la tienda")*

### B. Pruebas en celular real

- [ ] 7. Compila el APK de prueba: `npm run build && npx cap sync android && cd android && ./gradlew assembleDebug`. *(commit: crear `docs/pruebas-celular.md` con instrucciones de compilación)*
- [ ] 8. Instala `android/app/build/outputs/apk/debug/app-debug.apk` en un celular Android real y documenta modelo y versión. *(commit: "Documentar instalación en celular")*
- [ ] 9. Prueba todas las pantallas (Splash, Inicio, Ajustes, Cómo jugar, etc.) y anota resultados. *(commit: "Documentar pruebas de todas las pantallas")*
- [ ] 10. Prueba 3 canciones completas en nivel Fácil. *(commit: "Documentar pruebas de canciones en nivel Fácil")*
- [ ] 11. Prueba 2 canciones en nivel Medio y 1 en Difícil. *(commit: "Documentar pruebas de niveles Medio y Difícil")*
- [ ] 12. Prueba los 3 easter eggs documentados (7 toques al logo, 5 toques en UPB, full combo). *(commit: "Documentar pruebas de easter eggs")*
- [ ] 13. Crea issues en GitHub para cualquier error encontrado (título claro + pasos para repetirlo). *(si hay errores, commit: "Crear issues para errores encontrados")*
- [ ] 14. Prueba vibración con ajustes activados/desactivados. *(commit: "Documentar pruebas de vibración")*
- [ ] 15. Verifica persistencia: cierra app, abre de nuevo, comprueba que se guardan puntajes y progreso. *(commit: "Documentar pruebas de persistencia")*
- [ ] 16. Documenta tiempos de carga y rendimiento general en celular. *(commit: "Documentar rendimiento en celular")*

> Total: 16 pasos. Con 10 ya cumples el mínimo.

---

## Juan Pablo – ya hecho / pendiente

- **Hecho**: motor del juego, audio, pantallas, persistencia, easter eggs #1–#3, pruebas automáticas, proyecto Android, iconos.
- **Pendiente**: revisar los pull requests del equipo, integrar cambios y subir la app a Google Play (cuando el equipo termine las tareas).

--- Ayuda rápida

| Quiero... | Mira |
|-----------|------|
| Cambiar un texto de una pantalla | `src/pantallas/<pantalla>.js` |
| Cambiar colores | `src/estilos/base.css` (variables `--cian`, `--magenta`...) |
| Agregar una canción | `src/canciones/` + `index.js` |
| Cambiar la dificultad | `src/niveles.js` |
| Probar todo automáticamente | `python3 pruebas/e2e.py` (con `npm run dev` activo) |
