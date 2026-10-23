// "Cascabeles" (Jingle Bells, estribillo) - James Lord Pierpont (1857), dominio público.
import { partitura, unir } from './notacion.js';

const P1 = 'E4 E4 E4:2  E4 E4 E4:2  E4 G4 C4:1.5 D4:0.5  E4:4';
const P2 = 'F4 F4 F4:1.5 F4:0.5  F4 E4 E4 E4:0.5 E4:0.5  E4 D4 D4 E4  D4:2 G4:2';
const P3 = 'F4 F4 F4:1.5 F4:0.5  F4 E4 E4 E4:0.5 E4:0.5  G4 G4 F4 D4  C4:4';

export default {
  id: 'cascabeles',
  titulo: 'Cascabeles',
  artista: 'J. L. Pierpont (dominio público)',
  descripcion: 'Estribillo navideño con sonido de guitarra.',
  bpm: 124,
  instrumento: 'guitarra',
  ritmo: 'pop',
  color: '#ffd84a',
  melodia: unir(P1, P2, P1, P3),
  bajo: partitura(`
    C3:4 C3:4 C3:4 C3:4
    F3:4 C3:4 G2:4 G2:4
    C3:4 C3:4 C3:4 C3:4
    F3:4 C3:4 G2:2 C3:2 C3:4`),
};
