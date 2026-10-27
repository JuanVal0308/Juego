// =====================================================================
// canciones/index.js
// Catálogo de canciones. El ORDEN de esta lista es el orden de
// desbloqueo: se abre la siguiente canción al conseguir al menos
// 1 estrella en el nivel Fácil de la anterior.
//
// =====================================================================
import estrellita from './estrellita.js';
import himno from './himno-alegria.js';
import elisa from './para-elisa.js';
import cascabeles from './cascabeles.js';
import hermanoJuan from './cancion-nueva-1.js';
import mariaCorderito from './cancion-nueva-2.js';
import neonPulse from './neon-pulse.js';
import latido from './latido-cosmico.js';
import arcoiris from './arcoiris.js';

export const CANCIONES = [
  estrellita, himno, elisa, cascabeles, hermanoJuan, mariaCorderito, neonPulse, latido, arcoiris,
];

export const cancionPorId = (id) => CANCIONES.find((c) => c.id === id);
