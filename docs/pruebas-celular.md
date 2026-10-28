# Pruebas en celular real

## Dispositivo

- **Modelo:** Samsung Galaxy A35
- **Fecha:** 2026-10-28
- **APK probado:** `app-debug.apk` (compilado localmente con `./gradlew assembleDebug`, JDK 21)

## Errores encontrados

| # | Descripción | Issue | Estado |
|---|-------------|-------|--------|
| 1 | Las letras **D/F/J/K** se mostraban debajo de los carriles y en "Cómo jugar", aunque en celular se juega tocando con el dedo (no hay teclado físico). Podía confundir a quien juega por primera vez. | [#3](https://github.com/JuanVal0308/NotaFlow/issues/3) | ✅ Corregido (commit `8c189f0`): esas letras ahora solo se dibujan si el dispositivo tiene puntero fino (mouse/teclado), no en pantallas táctiles. |

Si aparecen más errores al seguir probando, se agregan aquí como nuevas filas (con su issue y el commit que los corrige).
