// =====================================================================
// notacion.js
// Mini lenguaje para escribir melodías como texto legible.
//
//   "C4 D4 E4:2 -:1"   ->  Do4 (1 pulso), Re4 (1 pulso), Mi4 (2 pulsos), silencio (1 pulso)
//
// Cada elemento es  NOTA[:duración en pulsos]. El silencio se escribe "-".
// Si no se indica duración, vale 1 pulso (una negra).
// Las notas se escriben en notación anglosajona: C=Do, D=Re, E=Mi, F=Fa,
// G=Sol, A=La, B=Si; "#" es sostenido y "b" es bemol. Ej: "F#4", "Bb3".
// =====================================================================
import { notaAMidi } from '../util/musica.js';

/** Convierte el texto en una lista de [nombreNota, duraciónEnPulsos]. */
export function partitura(texto) {
  return texto.trim().split(/\s+/).map((token) => {
    const [nota, dur] = token.split(':');
    return [nota, dur === undefined ? 1 : parseFloat(dur)];
  });
}

/** Une varias partituras (texto o listas) en una sola. */
export function unir(...partes) {
  return partes.flatMap((p) => (typeof p === 'string' ? partitura(p) : p));
}

/** Sube o baja una melodía los semitonos indicados (útil para repeticiones más agudas). */
export function transponer(melodia, semitonos) {
  const nombres = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return melodia.map(([nota, dur]) => {
    const midi = notaAMidi(nota);
    if (midi === null) return [nota, dur];
    const nuevo = midi + semitonos;
    return [`${nombres[nuevo % 12]}${Math.floor(nuevo / 12) - 1}`, dur];
  });
}

/** Suma de pulsos de una lista de [nota, duración]. */
export const totalPulsos = (lista) => lista.reduce((s, [, d]) => s + d, 0);
