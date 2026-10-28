// =====================================================================
// dibujo.js
// Dibuja el juego en un <canvas>: carriles, notas que caen, línea de
// golpeo, brillos, partículas y textos de juicio.
// Solo LEE el estado de la partida; no cambia ninguna regla del juego.
// =====================================================================
import { SistemaParticulas } from './particulas.js';
import { DESFASE_MS, NUM_CARRILES } from '../niveles.js';
import { ACERTADA, PENDIENTE } from './partida.js';

export const COLORES_CARRIL = ['#22e5ff', '#ff2bd6', '#ffd84a', '#4dff9a'];
export const TECLAS = ['D', 'F', 'J', 'K'];

const TEXTOS = { perfecto: '¡PERFECTO!', bien: 'Bien', fallo: 'Fallo' };
const COLOR_TEXTO = { perfecto: '#ffd84a', bien: '#22e5ff', fallo: '#ff4d6d' };

export class Lienzo {
  constructor(canvas, { arcoiris = false } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.arcoiris = arcoiris;
    this.particulas = new SistemaParticulas();
    this.destelloCarril = new Array(NUM_CARRILES).fill(0); // 0..1, se apaga solo
    this.presionado = new Array(NUM_CARRILES).fill(false);
    this.juicios = [];       // textos flotantes [{texto, color, edad}]
    this.pulsoBeat = 0;      // 0..1, destello de fondo al ritmo
    this.destelloFallo = 0;  // viñeta roja al fallar
    this.ultimoBeat = -1;
    // En celular se toca con el dedo: las letras D/F/J/K solo tienen sentido con teclado físico.
    this.mostrarTeclas = !('ontouchstart' in window) && matchMedia('(pointer: fine)').matches;
    this.estrellasFondo = Array.from({ length: 36 }, () => ({ x: Math.random(), y: Math.random(), v: 0.01 + Math.random() * 0.03, r: 0.6 + Math.random() * 1.4 }));
    this.redimensionar();
  }

  /** Ajusta la resolución del canvas a la pantalla (con nitidez en pantallas retina). */
  redimensionar() {
    const caja = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.ancho = Math.max(1, caja.width);
    this.alto = Math.max(1, caja.height);
    this.canvas.width = Math.round(this.ancho * dpr);
    this.canvas.height = Math.round(this.alto * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.yGolpe = this.alto * 0.82; // altura de la línea donde hay que tocar
  }

  /** Posición X del centro de un carril. */
  xCarril(c) { return (this.ancho / NUM_CARRILES) * (c + 0.5); }

  colorCarril(c, t = 0) {
    if (this.arcoiris) return `hsl(${(t * 0.12 + c * 70) % 360} 100% 62%)`;
    return COLORES_CARRIL[c];
  }

  // ---------- Eventos que disparan efectos ----------
  efectoToque(carril) { this.destelloCarril[carril] = 1; }
  efectoJuicio(tipo, carril, tiempo) {
    const color = this.colorCarril(carril, tiempo);
    this.juicios.push({ texto: TEXTOS[tipo], color: COLOR_TEXTO[tipo], edad: 0, x: this.xCarril(carril) });
    if (this.juicios.length > 4) this.juicios.shift();
    if (tipo === 'fallo') this.destelloFallo = 1;
    else this.particulas.explosion(this.xCarril(carril), this.yGolpe, color, tipo === 'perfecto' ? 20 : 10, tipo === 'perfecto' ? 1.2 : 0.8);
    this.destelloCarril[carril] = 1;
  }
  efectoCombo() { this.particulas.confeti(this.ancho, 36); }

  // ---------- Actualización de animaciones ----------
  actualizar(dt, partida) {
    this.particulas.actualizar(dt);
    for (let i = 0; i < NUM_CARRILES; i++) this.destelloCarril[i] = Math.max(0, this.destelloCarril[i] - dt / 260);
    this.pulsoBeat = Math.max(0, this.pulsoBeat - dt / 420);
    this.destelloFallo = Math.max(0, this.destelloFallo - dt / 450);
    for (const j of this.juicios) j.edad += dt;
    this.juicios = this.juicios.filter((j) => j.edad < 700);
    for (const e of this.estrellasFondo) { e.y += e.v * dt / 1000; if (e.y > 1) e.y = 0; }
    // Un pulso de luz en cada tiempo (beat) de la canción
    if (partida && partida.tiempo >= DESFASE_MS) {
      const beat = Math.floor((partida.tiempo - DESFASE_MS) / (60000 / partida.cancion.bpm));
      if (beat !== this.ultimoBeat) { this.ultimoBeat = beat; this.pulsoBeat = 1; }
    }
  }

  // ---------- Dibujo principal ----------
  dibujar(partida) {
    const { ctx, ancho, alto, yGolpe } = this;
    const t = partida ? partida.tiempo : 0;
    ctx.clearRect(0, 0, ancho, alto);

    // Fondo: degradado + estrellas que bajan + resplandor al ritmo
    const fondo = ctx.createLinearGradient(0, 0, 0, alto);
    fondo.addColorStop(0, '#0d0420');
    fondo.addColorStop(0.7, '#1a0a3d');
    fondo.addColorStop(1, '#2a0a45');
    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, ancho, alto);
    ctx.fillStyle = '#ffffff';
    for (const e of this.estrellasFondo) {
      ctx.globalAlpha = 0.25 + 0.4 * e.r / 2;
      ctx.beginPath(); ctx.arc(e.x * ancho, e.y * alto, e.r, 0, 6.3); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (this.pulsoBeat > 0) {
      const g = ctx.createRadialGradient(ancho / 2, yGolpe, 10, ancho / 2, yGolpe, alto * 0.7);
      g.addColorStop(0, `rgba(255,43,214,${0.22 * this.pulsoBeat})`);
      g.addColorStop(1, 'rgba(255,43,214,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, ancho, alto);
    }

    // Carriles: franjas y divisiones de neón
    const wC = ancho / NUM_CARRILES;
    for (let c = 0; c < NUM_CARRILES; c++) {
      const color = this.colorCarril(c, t);
      const grad = ctx.createLinearGradient(0, 0, 0, yGolpe);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(1, hexAlpha(color, 0.08 + 0.3 * this.destelloCarril[c]));
      ctx.fillStyle = grad;
      ctx.fillRect(c * wC, 0, wC, alto);
      if (c > 0) {
        ctx.strokeStyle = 'rgba(138,92,255,0.45)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(c * wC, 0); ctx.lineTo(c * wC, alto); ctx.stroke();
      }
    }

    if (!partida) return;

    // Líneas de pulso (una por tiempo): bajan igual que las notas, dan sensación de ritmo
    const msPulso = 60000 / partida.cancion.bpm;
    const caida = partida.nivel.tiempoCaidaMs;
    const primero = Math.max(0, Math.ceil((t - DESFASE_MS) / msPulso));
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    for (let k = primero; ; k++) {
      const tk = DESFASE_MS + k * msPulso;
      if (tk - t > caida) break;
      const y = yGolpe * (1 - (tk - t) / caida);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ancho, y); ctx.stroke();
    }

    // Línea de golpeo y "pads" de cada carril
    ctx.strokeStyle = 'rgba(255,255,255,0.65)'; ctx.lineWidth = 2;
    ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.moveTo(0, yGolpe); ctx.lineTo(ancho, yGolpe); ctx.stroke();
    ctx.shadowBlur = 0;
    for (let c = 0; c < NUM_CARRILES; c++) {
      const x = this.xCarril(c), color = this.colorCarril(c, t);
      const radio = wC * 0.36 * (1 + 0.12 * this.destelloCarril[c] + (this.presionado[c] ? 0.05 : 0));
      ctx.beginPath(); ctx.arc(x, yGolpe, radio, 0, Math.PI * 2);
      ctx.fillStyle = hexAlpha(color, 0.12 + 0.55 * this.destelloCarril[c]);
      ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = color;
      ctx.shadowColor = color; ctx.shadowBlur = 12 + 14 * this.destelloCarril[c];
      ctx.stroke(); ctx.shadowBlur = 0;
      // Letra de la tecla: solo en computador (con teclado físico), en celular estorba
      if (this.mostrarTeclas) {
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = '700 14px "Trebuchet MS", sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(TECLAS[c], x, yGolpe + radio + 22);
      }
    }

    // Notas que caen
    const altoNota = Math.max(20, wC * 0.26);
    for (const n of partida.notas) {
      if (n.t - t > caida) break;
      if (n.estado === ACERTADA) continue;
      const y = yGolpe * (1 - (n.t - t) / caida);
      if (y > this.alto + 30) continue;
      const x = this.xCarril(n.carril);
      const color = this.colorCarril(n.carril, t);
      const ancho2 = wC * 0.74;
      const fallada = n.estado !== PENDIENTE;
      ctx.globalAlpha = fallada ? 0.28 : 1;
      ctx.shadowColor = color; ctx.shadowBlur = fallada ? 0 : 16;
      const g = ctx.createLinearGradient(x - ancho2 / 2, y - altoNota / 2, x + ancho2 / 2, y + altoNota / 2);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, color); g.addColorStop(1, hexAlpha(color, 0.75));
      ctx.fillStyle = g;
      rectRedondeado(ctx, x - ancho2 / 2, y - altoNota / 2, ancho2, altoNota, altoNota / 2.2);
      ctx.fill();
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }

    // Partículas, textos de juicio y viñeta de fallo
    this.particulas.dibujar(ctx);
    for (const j of this.juicios) {
      const p = j.edad / 700;
      ctx.globalAlpha = 1 - p * p;
      ctx.fillStyle = j.color; ctx.shadowColor = j.color; ctx.shadowBlur = 12;
      ctx.font = `900 ${22 + (1 - p) * 6}px "Trebuchet MS", sans-serif`; ctx.textAlign = 'center';
      ctx.fillText(j.texto, ancho / 2, yGolpe - 80 - p * 40);
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    if (this.destelloFallo > 0) {
      const v = ctx.createRadialGradient(ancho / 2, alto / 2, alto * 0.25, ancho / 2, alto / 2, alto * 0.75);
      v.addColorStop(0, 'rgba(255,77,109,0)');
      v.addColorStop(1, `rgba(255,77,109,${0.45 * this.destelloFallo})`);
      ctx.fillStyle = v; ctx.fillRect(0, 0, ancho, alto);
    }
  }
}

// ---------- Utilidades de dibujo ----------
function rectRedondeado(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Convierte un color (#rrggbb o hsl(...)) a uno con transparencia. */
function hexAlpha(color, alfa) {
  if (color.startsWith('hsl')) return color.replace(')', ` / ${alfa})`);
  const n = parseInt(color.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alfa})`;
}
