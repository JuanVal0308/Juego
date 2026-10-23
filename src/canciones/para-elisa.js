// "Para Elisa" (Für Elise, inicio) - Ludwig van Beethoven (1810), dominio público.
// Las notas rápidas son semicorcheas: 0.25 pulsos.
import { partitura, unir } from './notacion.js';

const TEMA = `E5:0.25 D#5:0.25 E5:0.25 D#5:0.25 E5:0.25 B4:0.25 D5:0.25 C5:0.25 A4:0.75 -:0.25
  C4:0.25 E4:0.25 A4:0.25 B4:0.75 -:0.25 E4:0.25 G#4:0.25 B4:0.25 C5:0.75 -:0.25`;
const TEMA_2 = `E4:0.25 E5:0.25 D#5:0.25 E5:0.25 D#5:0.25 E5:0.25 B4:0.25 D5:0.25 C5:0.25 A4:0.75 -:0.25
  C4:0.25 E4:0.25 A4:0.25 B4:0.75 -:0.25 E4:0.25 C5:0.25 B4:0.25 A4:1.5 -:0.5`;

export default {
  id: 'para-elisa',
  titulo: 'Para Elisa',
  artista: 'L. v. Beethoven (dominio público)',
  descripcion: 'Notas rápidas y trinos: ideal para los más rápidos.',
  bpm: 62,
  instrumento: 'piano',
  ritmo: 'suave',
  color: '#8a5cff',
  melodia: unir(TEMA, TEMA_2, TEMA, TEMA_2),
  bajo: partitura(`
    A2:1.5 E3:1.5 A2:1.5 E3:1.5
    A2:1.5 E3:1.5 A2:1.5 E3:1.5
    A2:1.5 E3:1.5 A2:1.5 E3:1.5
    A2:1.5 E3:1.5 A2:1.5 E3:1.5`),
};
