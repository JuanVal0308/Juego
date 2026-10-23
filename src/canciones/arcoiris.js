// "Arcoíris" - canción SECRETA y original (easter egg: se desbloquea tocando el logo 7 veces).
import { partitura, unir } from './notacion.js';

const A = 'C4:0.5 E4:0.5 G4:0.5 C5:0.5 E5:0.5 C5:0.5 G4:0.5 E4:0.5';
const B = 'D4:0.5 F4:0.5 A4:0.5 D5:0.5 F5:0.5 D5:0.5 A4:0.5 F4:0.5';
const C = 'E4:0.5 G4:0.5 B4:0.5 E5:0.5 G5:0.5 E5:0.5 B4:0.5 G4:0.5';
const D = 'F4:0.5 A4:0.5 C5:0.5 F5:0.5 A5:0.5 F5:0.5 C5:0.5 A4:0.5';
const E = 'G4:0.5 B4:0.5 D5:0.5 G5:0.5 D5:0.5 B4:0.5 D5:0.5 B4:0.5';
const FIN = 'C5 E5 G5 C6';

export default {
  id: 'arcoiris',
  titulo: 'Arcoíris (secreta)',
  artista: 'NotaFlow (original)',
  descripcion: '¡Encontraste la canción secreta! Arpegios de colores a toda velocidad.',
  bpm: 144,
  instrumento: 'sinte',
  ritmo: 'electro',
  color: '#ffffff',
  secreta: true,
  melodia: unir(A, B, C, D, A, B, C, D, E, D, C, B, A, B, C, D, FIN),
  bajo: partitura(`
    C3:4 D3:4 E3:4 F3:4  C3:4 D3:4 E3:4 F3:4
    G2:4 F3:4 E3:4 D3:4  C3:4 D3:4 E3:4 F3:4
    C3:4`),
};
