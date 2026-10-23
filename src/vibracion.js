// =====================================================================
// vibracion.js
// Retroalimentación háptica con navigator.vibrate (Android/WebView).
// Respeta el ajuste "vibración" del jugador y falla en silencio si el
// dispositivo (o el navegador de escritorio) no la soporta.
// =====================================================================
import { obtenerAjustes } from './almacenamiento.js';

const PATRONES = {
  toque: 8,
  perfecto: 14,
  bien: 10,
  fallo: [30, 40, 30],
  combo: [12, 30, 12],
  victoria: [40, 60, 40, 60, 90],
  derrota: [120, 60, 220],
  clic: 6,
};

export function vibrar(nombre) {
  if (!obtenerAjustes().vibracion) return;
  if (typeof navigator.vibrate !== 'function') return;
  try { navigator.vibrate(PATRONES[nombre] ?? 10); } catch { /* algunos navegadores bloquean vibrate sin gesto */ }
}
