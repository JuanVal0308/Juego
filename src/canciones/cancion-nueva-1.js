// "Hermano Juan" (Frère Jacques) - melodía tradicional de dominio público.
import { partitura } from './notacion.js';

const A = 'C4 D4 E4 C4';

export default {
  id: 'hermano-juan',
  titulo: 'Hermano Juan',
  artista: 'Tradicional francesa (dominio público)',
  descripcion: 'Una ronda tradicional de frases cortas y repetitivas.',
  bpm: 100,
  instrumento: 'piano',
  ritmo: 'suave',
  color: '#22e5ff',
  melodia: partitura(A),
  bajo: [],
};
