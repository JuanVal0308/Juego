// "Himno a la Alegría" - Ludwig van Beethoven (1824), dominio público.
import { partitura, unir } from './notacion.js';

const F1 = 'E4 E4 F4 G4  G4 F4 E4 D4  C4 C4 D4 E4  E4:1.5 D4:0.5 D4:2';
const F2 = 'E4 E4 F4 G4  G4 F4 E4 D4  C4 C4 D4 E4  D4:1.5 C4:0.5 C4:2';
const F3 = 'D4 D4 E4 C4  D4 E4:0.5 F4:0.5 E4 C4  D4 E4:0.5 F4:0.5 E4 D4  C4 D4 G3:2';

export default {
  id: 'himno-alegria',
  titulo: 'Himno a la Alegría',
  artista: 'L. v. Beethoven (dominio público)',
  descripcion: 'El tema de la 9.ª Sinfonía, con ritmo más marcado.',
  bpm: 108,
  instrumento: 'piano',
  ritmo: 'pop',
  color: '#ff2bd6',
  melodia: unir(F1, F2, F3, F2),
  bajo: partitura(`
    C3:4 G2:4 C3:4 G2:4
    C3:4 G2:4 C3:4 G2:2 C3:2
    G2:4 C3:4 G2:4 C3:4
    C3:4 G2:4 C3:4 G2:2 C3:2`),
};
