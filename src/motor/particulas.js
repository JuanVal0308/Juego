// =====================================================================
// particulas.js
// Sistema sencillo de partículas para chispas, confeti y destellos.
// Cada partícula tiene posición, velocidad, vida y color.
// =====================================================================

const MAX_PARTICULAS = 260; // límite para no ahogar celulares modestos

export class SistemaParticulas {
  constructor() { this.lista = []; }

  /** Explosión de chispas en (x, y). */
  explosion(x, y, color, cantidad = 14, fuerza = 1) {
    for (let i = 0; i < cantidad; i++) {
      const ang = Math.random() * Math.PI * 2;
      const vel = (0.06 + Math.random() * 0.22) * fuerza; // px por ms
      this.agregar({ x, y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel - 0.05, vida: 380 + Math.random() * 300, tam: 2 + Math.random() * 3.5, color, gravedad: 0.00045 });
    }
  }

  /** Lluvia de confeti desde arriba (easter egg y pantalla de victoria). */
  confeti(ancho, cantidad = 70) {
    const colores = ['#22e5ff', '#ff2bd6', '#ffd84a', '#4dff9a', '#8a5cff'];
    for (let i = 0; i < cantidad; i++) {
      this.agregar({
        x: Math.random() * ancho, y: -10 - Math.random() * 60,
        vx: (Math.random() - 0.5) * 0.08, vy: 0.08 + Math.random() * 0.14,
        vida: 2200 + Math.random() * 1500, tam: 3 + Math.random() * 4,
        color: colores[i % colores.length], gravedad: 0.00004, cuadrada: true,
      });
    }
  }

  agregar(p) {
    if (this.lista.length >= MAX_PARTICULAS) this.lista.shift();
    p.vidaMax = p.vida;
    this.lista.push(p);
  }

  actualizar(dt) {
    for (const p of this.lista) {
      p.vida -= dt;
      p.vy += p.gravedad * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    this.lista = this.lista.filter((p) => p.vida > 0);
  }

  dibujar(ctx) {
    for (const p of this.lista) {
      ctx.globalAlpha = Math.max(0, p.vida / p.vidaMax);
      ctx.fillStyle = p.color;
      if (p.cuadrada) ctx.fillRect(p.x, p.y, p.tam, p.tam * 1.6);
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.tam, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }

  limpiar() { this.lista.length = 0; }
}
