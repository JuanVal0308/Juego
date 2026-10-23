// =====================================================================
// confeti.js - Lluvia de confeti sobre cualquier pantalla (celebraciones y easter eggs)
// =====================================================================
import { SistemaParticulas } from '../motor/particulas.js';

export function lanzarConfeti(cantidad = 90, duracionMs = 3200) {
  const canvas = document.createElement('canvas');
  canvas.className = 'capa-confeti';
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:40';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const ancho = (canvas.width = window.innerWidth);
  const alto = (canvas.height = window.innerHeight);
  const sistema = new SistemaParticulas();
  sistema.confeti(ancho, cantidad);
  let anterior = performance.now();
  const inicio = anterior;
  (function cuadro(ahora) {
    const dt = Math.min(50, ahora - anterior); anterior = ahora;
    sistema.actualizar(dt);
    ctx.clearRect(0, 0, ancho, alto);
    sistema.dibujar(ctx);
    if (ahora - inicio < duracionMs && sistema.lista.length) requestAnimationFrame(cuadro);
    else canvas.remove();
  })(anterior);
}
