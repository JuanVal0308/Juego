// =====================================================================
// musica.js
// Utilidades de teoría musical: convierte nombres de notas ("C4", "F#3")
// a números MIDI y a frecuencias en Hz para el sintetizador.
// =====================================================================

const SEMITONOS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** "C4" -> 60, "A4" -> 69, "F#3" -> 54, "Bb3" -> 58. Devuelve null si es silencio ("-"). */
export function notaAMidi(nombre) {
  if (!nombre || nombre === '-' || nombre === 'R') return null;
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(nombre);
  if (!m) throw new Error(`Nota inválida: ${nombre}`);
  const [, letra, alteracion, octava] = m;
  let semitono = SEMITONOS[letra];
  if (alteracion === '#') semitono += 1;
  if (alteracion === 'b') semitono -= 1;
  return (Number(octava) + 1) * 12 + semitono;
}

/** Frecuencia en Hz de un número MIDI (A4 = 440 Hz). */
export const midiAFrecuencia = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

export const notaAFrecuencia = (nombre) => {
  const midi = notaAMidi(nombre);
  return midi === null ? null : midiAFrecuencia(midi);
};

/** Generador pseudoaleatorio con semilla (mulberry32): mismos resultados siempre. */
export function crearAleatorio(semilla) {
  let a = semilla >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Convierte un texto en un número (semilla) para el generador anterior. */
export function semillaDeTexto(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
