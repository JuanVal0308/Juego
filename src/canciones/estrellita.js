// "Estrellita" (Twinkle Twinkle Little Star) - melodía tradicional, dominio público.
import { partitura, unir } from './notacion.js';

const A = 'C4 C4 G4 G4 A4 A4 G4:2   F4 F4 E4 E4 D4 D4 C4:2';
const B = 'G4 G4 F4 F4 E4 E4 D4:2   G4 G4 F4 F4 E4 E4 D4:2';

export default {
  id: 'estrellita',
  titulo: 'Estrellita',
  artista: 'Tradicional (dominio público)',
  descripcion: 'La clásica canción de cuna para calentar los dedos.',
  bpm: 100,
  instrumento: 'piano',
  ritmo: 'suave',
  color: '#22e5ff',
  melodia: unir(A, B, B, A),
  // Bajo: [nota, pulsos]. Acompaña la melodía con notas graves.
  bajo: partitura(`
    C3:4 F3:2 C3:2 F3:2 C3:2 G2:2 C3:2
    C3:2 F3:2 C3:2 G2:2 C3:2 F3:2 C3:2 G2:2
    C3:2 F3:2 C3:2 G2:2 C3:2 F3:2 C3:2 G2:2
    C3:4 F3:2 C3:2 F3:2 C3:2 G2:2 C3:2`),
};
