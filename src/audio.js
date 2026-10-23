// =====================================================================
// audio.js
// Todo el sonido de NotaFlow se SINTETIZA con la Web Audio API:
// no hay archivos de audio ni música con derechos de autor.
//  - Instrumentos: guitarra (pluck), piano, sintetizador.
//  - Percusión: bombo, caja y hi-hat hechos con osciladores y ruido.
//  - Efectos de interfaz: clic, aciertos, fallos, victoria, derrota...
// =====================================================================
import { obtenerAjustes } from './almacenamiento.js';

let ctx = null;        // AudioContext (se crea tras el primer toque del usuario)
let maestro = null;    // ganancia general (volumen)
let ruido = null;      // buffer de ruido blanco reutilizable

/** Debe llamarse dentro de un gesto del usuario (toque/clic) para desbloquear el audio. */
export function iniciarAudio() {
  if (!ctx) {
    const Clase = window.AudioContext || window.webkitAudioContext;
    if (!Clase) return null;
    ctx = new Clase({ latencyHint: 'interactive' });
    const compresor = ctx.createDynamicsCompressor(); // evita saturación cuando suenan muchas voces
    compresor.threshold.value = -14;
    compresor.ratio.value = 6;
    maestro = ctx.createGain();
    maestro.connect(compresor).connect(ctx.destination);
    // Buffer de 1 s de ruido blanco para caja y hi-hat
    ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = ruido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') ctx.resume();
  actualizarVolumen();
  return ctx;
}

export const tiempoAudio = () => (ctx ? ctx.currentTime : 0);
export const audioDisponible = () => !!ctx && obtenerAjustes().sonido;

/** Aplica el volumen y el interruptor de sonido de los ajustes. */
export function actualizarVolumen() {
  if (!maestro) return;
  const a = obtenerAjustes();
  maestro.gain.value = a.sonido ? a.volumen : 0;
}

// ---------------------------------------------------------------------
// Bloques básicos
// ---------------------------------------------------------------------

/** Crea un oscilador con envolvente ADSR simple y lo programa en el tiempo t. */
function voz({ freq, tipo = 'sine', t, dur = 0.3, vol = 0.3, ataque = 0.005, filtro = null, desafinar = 0, destino }) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, t);
  osc.detune.value = desafinar;
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(vol, t + ataque);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let salida = osc;
  if (filtro) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(filtro.inicio, t);
    f.frequency.exponentialRampToValueAtTime(filtro.fin, t + dur);
    osc.connect(f);
    salida = f;
  }
  salida.connect(amp).connect(destino || maestro);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** Ráfaga de ruido filtrado (para caja y hi-hat). */
function rafagaRuido({ t, dur, vol, tipoFiltro, frecuencia }) {
  const fuente = ctx.createBufferSource();
  fuente.buffer = ruido;
  const f = ctx.createBiquadFilter();
  f.type = tipoFiltro;
  f.frequency.value = frecuencia;
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(vol, t);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  fuente.connect(f).connect(amp).connect(maestro);
  fuente.start(t);
  fuente.stop(t + dur + 0.02);
}

// ---------------------------------------------------------------------
// Instrumentos melódicos
// ---------------------------------------------------------------------

/**
 * Toca una nota con el instrumento indicado.
 * @param {number} freq Frecuencia en Hz
 * @param {'guitarra'|'piano'|'sinte'} instrumento
 * @param {number} t tiempo del AudioContext (por defecto: ahora)
 * @param {number} dur duración en segundos
 */
export function tocarNota(freq, instrumento = 'piano', t = null, dur = 0.5, vol = 0.32) {
  if (!audioDisponible() || !freq) return;
  t = t ?? ctx.currentTime;
  switch (instrumento) {
    case 'guitarra': // cuerda pulsada: diente de sierra + filtro que se cierra rápido
      voz({ freq, tipo: 'sawtooth', t, dur: Math.max(dur, 0.5), vol: vol * 0.8, filtro: { inicio: 4200, fin: 500 } });
      voz({ freq: freq * 2, tipo: 'triangle', t, dur: 0.25, vol: vol * 0.25 });
      break;
    case 'sinte': // sintetizador neón: dos cuadradas ligeramente desafinadas
      voz({ freq, tipo: 'square', t, dur: Math.max(dur, 0.4), vol: vol * 0.45, desafinar: -8, filtro: { inicio: 3000, fin: 900 } });
      voz({ freq, tipo: 'square', t, dur: Math.max(dur, 0.4), vol: vol * 0.45, desafinar: 8, filtro: { inicio: 3000, fin: 900 } });
      break;
    default: // piano: fundamental + armónicos con decaimiento
      voz({ freq, tipo: 'triangle', t, dur: Math.max(dur, 0.7), vol, ataque: 0.004 });
      voz({ freq: freq * 2, tipo: 'sine', t, dur: 0.4, vol: vol * 0.35 });
      voz({ freq: freq * 3, tipo: 'sine', t, dur: 0.2, vol: vol * 0.15 });
  }
}

/** Nota con timbre "apagado" para cuando el jugador falla. */
export function tocarNotaMala() {
  if (!audioDisponible()) return;
  const t = ctx.currentTime;
  voz({ freq: 90 + Math.random() * 30, tipo: 'sawtooth', t, dur: 0.18, vol: 0.18, filtro: { inicio: 600, fin: 120 } });
  rafagaRuido({ t, dur: 0.1, vol: 0.12, tipoFiltro: 'lowpass', frecuencia: 400 });
}

// ---------------------------------------------------------------------
// Percusión y bajo (acompañamiento programado)
// ---------------------------------------------------------------------
export function bombo(t) {
  if (!audioDisponible()) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.14);
  amp.gain.setValueAtTime(0.7, t);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  osc.connect(amp).connect(maestro);
  osc.start(t); osc.stop(t + 0.25);
}
export function caja(t) {
  if (!audioDisponible()) return;
  rafagaRuido({ t, dur: 0.14, vol: 0.35, tipoFiltro: 'highpass', frecuencia: 1500 });
  voz({ freq: 190, tipo: 'triangle', t, dur: 0.1, vol: 0.25 });
}
export function hihat(t, abierto = false) {
  if (!audioDisponible()) return;
  rafagaRuido({ t, dur: abierto ? 0.18 : 0.05, vol: 0.14, tipoFiltro: 'highpass', frecuencia: 7500 });
}
export function bajo(freq, t, dur = 0.4) {
  if (!audioDisponible() || !freq) return;
  voz({ freq, tipo: 'triangle', t, dur, vol: 0.34, ataque: 0.01, filtro: { inicio: 900, fin: 250 } });
}

// ---------------------------------------------------------------------
// Efectos de interfaz y de juego
// ---------------------------------------------------------------------
export function sonidoClic() {
  if (!audioDisponible()) return;
  const t = ctx.currentTime;
  voz({ freq: 660, tipo: 'square', t, dur: 0.07, vol: 0.12, filtro: { inicio: 2500, fin: 800 } });
}
export function sonidoAtras() {
  if (!audioDisponible()) return;
  const t = ctx.currentTime;
  voz({ freq: 440, tipo: 'square', t, dur: 0.07, vol: 0.1, filtro: { inicio: 2000, fin: 600 } });
}

/** Chasquido de acierto: más agudo y brillante si fue "perfecto". */
export function sonidoAcierto(perfecto) {
  if (!audioDisponible()) return;
  const t = ctx.currentTime;
  rafagaRuido({ t, dur: 0.04, vol: perfecto ? 0.12 : 0.07, tipoFiltro: 'highpass', frecuencia: perfecto ? 6000 : 4000 });
  if (perfecto) voz({ freq: 1760, tipo: 'sine', t, dur: 0.09, vol: 0.06 });
}

/** Arpegio ascendente al subir el multiplicador de combo. */
export function sonidoCombo(nivel) {
  if (!audioDisponible()) return;
  const t = ctx.currentTime;
  const base = 523.25 * Math.pow(2, (nivel - 1) / 12 * 2);
  [0, 4, 7, 12].forEach((s, i) => voz({ freq: base * Math.pow(2, s / 12), tipo: 'triangle', t: t + i * 0.05, dur: 0.18, vol: 0.2 }));
}

export function sonidoCuentaAtras(final = false) {
  if (!audioDisponible()) return;
  const t = ctx.currentTime;
  voz({ freq: final ? 1046 : 660, tipo: 'square', t, dur: final ? 0.3 : 0.12, vol: 0.14, filtro: { inicio: 3000, fin: 1000 } });
}
export function sonidoPausa() {
  if (!audioDisponible()) return;
  const t = ctx.currentTime;
  voz({ freq: 520, tipo: 'sine', t, dur: 0.12, vol: 0.18 });
  voz({ freq: 390, tipo: 'sine', t: t + 0.09, dur: 0.14, vol: 0.18 });
}
export function sonidoVictoria() {
  if (!audioDisponible()) return;
  const t = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
    tocarNota(f, 'sinte', t + i * 0.12, 0.5, 0.3);
  });
}
export function sonidoEstrella(indice) {
  if (!audioDisponible()) return;
  const t = ctx.currentTime;
  voz({ freq: 880 * Math.pow(2, indice * 4 / 12), tipo: 'triangle', t, dur: 0.35, vol: 0.28 });
  voz({ freq: 1760 * Math.pow(2, indice * 4 / 12), tipo: 'sine', t, dur: 0.25, vol: 0.12 });
}
export function sonidoDerrota() {
  if (!audioDisponible()) return;
  const t = ctx.currentTime;
  [392, 330, 262, 196].forEach((f, i) => voz({ freq: f, tipo: 'sawtooth', t: t + i * 0.18, dur: 0.4, vol: 0.2, filtro: { inicio: 1500, fin: 200 } }));
}
/** Barrido ascendente del logo en la pantalla de inicio. */
export function sonidoLogo() {
  if (!audioDisponible()) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(110, t);
  osc.frequency.exponentialRampToValueAtTime(880, t + 0.45);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(0.22, t + 0.1);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.setValueAtTime(400, t);
  f.frequency.exponentialRampToValueAtTime(5000, t + 0.45);
  osc.connect(f).connect(amp).connect(maestro);
  osc.start(t); osc.stop(t + 0.7);
  [659.25, 880, 1318.5].forEach((fr, i) => tocarNota(fr, 'sinte', t + 0.45 + i * 0.07, 0.6, 0.25));
}
/** Pequeño tintineo del toque del logo (easter egg: se vuelve más agudo cada toque). */
export function sonidoToqueLogo(n) {
  if (!audioDisponible()) return;
  const t = ctx.currentTime;
  const escala = [0, 2, 4, 5, 7, 9, 11, 12];
  voz({ freq: 523.25 * Math.pow(2, escala[Math.min(n, 7)] / 12), tipo: 'triangle', t, dur: 0.25, vol: 0.28 });
}
export function sonidoSecreto() {
  if (!audioDisponible()) return;
  const t = ctx.currentTime;
  [0, 4, 7, 11, 14, 16, 19, 23, 26, 28, 31].forEach((s, i) => {
    tocarNota(392 * Math.pow(2, s / 12), 'sinte', t + i * 0.07, 0.4, 0.25);
  });
}
