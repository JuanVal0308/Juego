// "Neon Pulse" - canción ORIGINAL del equipo NotaFlow (la Mayor / La menor, estilo synthwave).
import { partitura, unir } from './notacion.js';

const A = `A4:0.5 C5:0.5 E5 C5:0.5 A4:0.5 E4
  F4:0.5 A4:0.5 C5 A4:0.5 F4:0.5 C4
  G4:0.5 B4:0.5 D5 B4:0.5 G4:0.5 D4
  E4:0.5 G#4:0.5 B4 E5:1.5 -:0.5`;
const B = `E5 E5:0.5 D5:0.5 C5 A4
  C5 C5:0.5 B4:0.5 A4 F4
  D5:0.5 E5:0.5 G5 E5:0.5 D5:0.5 B4
  A4:3 -:1`;

export default {
  id: 'neon-pulse',
  titulo: 'Neon Pulse',
  artista: 'NotaFlow (original)',
  descripcion: 'Synthwave original con arpegios que brillan.',
  bpm: 128,
  instrumento: 'sinte',
  ritmo: 'electro',
  color: '#ff2bd6',
  melodia: unir(A, B, A, B, 'A4:4'),
  bajo: partitura(`
    A2:4 F2:4 G2:4 E2:4  A2:4 F2:4 G2:4 A2:4
    A2:4 F2:4 G2:4 E2:4  A2:4 F2:4 G2:4 A2:4
    A2:4`),
};
