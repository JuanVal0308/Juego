// "María tenía un corderito" - melodía tradicional de dominio público.
import { partitura } from './notacion.js';

const A = 'E4 D4 C4 D4 E4 E4 E4:2';

export default {
  id: 'maria-corderito',
  titulo: 'María tenía un corderito',
  artista: 'Tradicional (dominio público)',
  descripcion: 'Una melodía infantil sencilla para practicar cambios de carril.',
  bpm: 100,
  instrumento: 'piano',
  ritmo: 'suave',
  color: '#22e5ff',
  melodia: partitura(A),
  bajo: [],
};
