// "María tenía un corderito" - melodía tradicional de dominio público.
import { partitura, unir } from './notacion.js';

const A = 'E4 D4 C4 D4 E4 E4 E4:2';
const B = 'D4 D4 D4:2 E4 G4 G4:2';
const C = 'E4 D4 C4 D4 E4 E4 E4 E4';
const D = 'D4 D4 E4 D4 C4:4';

export default {
  id: 'maria-corderito',
  titulo: 'María tenía un corderito',
  artista: 'Tradicional (dominio público)',
  descripcion: 'Una melodía infantil sencilla para practicar cambios de carril.',
  bpm: 116,
  instrumento: 'sinte',
  ritmo: 'electro',
  color: '#ff8a3d',
  melodia: unir(A, B, C, D),
  bajo: [],
};
