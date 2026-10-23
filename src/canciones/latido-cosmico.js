// "Latido Cósmico" - canción ORIGINAL del equipo NotaFlow (Mi menor, riff de guitarra rock).
import { partitura, unir, transponer } from './notacion.js';

const RIFF_1 = `E4:0.5 E4:0.5 G4:0.5 E4:0.5 A4 G4
  E4:0.5 E4:0.5 B4:0.5 E4:0.5 D5 B4`;
const RIFF_2 = `C5 B4:0.5 A4:0.5 G4 E4
  F#4:0.5 G4:0.5 A4 B4:2`;
const CICLO = unir(RIFF_1, RIFF_2);
// El segundo ciclo suena una octava arriba para dar sensación de subida de energía.
const CICLO_AGUDO = transponer(CICLO, 5);

export default {
  id: 'latido-cosmico',
  titulo: 'Latido Cósmico',
  artista: 'NotaFlow (original)',
  descripcion: 'Riff de rock espacial con golpes fuertes.',
  bpm: 112,
  instrumento: 'guitarra',
  ritmo: 'rock',
  color: '#4dff9a',
  melodia: unir(CICLO, CICLO_AGUDO, CICLO, CICLO_AGUDO, 'E4:4'),
  bajo: partitura(`
    E2:4 E2:4 C3:4 D3:4  E2:4 E2:4 C3:4 D3:4
    E2:4 E2:4 C3:4 D3:4  E2:4 E2:4 C3:4 D3:4
    E2:4`),
};
