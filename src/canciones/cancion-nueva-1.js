// "Hermano Juan" (Frère Jacques) - melodía tradicional de dominio público.
import { partitura, unir } from './notacion.js';

const A = 'C4 D4 E4 C4';
const B = 'E4 F4 G4:2';
const C = 'G4:0.5 A4:0.5 G4:0.5 F4:0.5 E4 C4';
const D = 'C4 G3 C4:2';

export default {
  id: 'hermano-juan',
  titulo: 'Hermano Juan',
  artista: 'Tradicional francesa (dominio público)',
  descripcion: 'Una ronda tradicional de frases cortas y repetitivas.',
  bpm: 112,
  instrumento: 'guitarra',
  ritmo: 'pop',
  color: '#4dff9a',
  melodia: unir(A, A, B, B, C, C, D, D),
  bajo: partitura(`
    C3:4 G2:4 C3:4 G2:4
    F3:4 C3:4 G2:4 C3:4`),
};
