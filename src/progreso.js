// =====================================================================
// progreso.js
// Reglas de DESBLOQUEO (progresión del juego):
//  - El nivel Fácil de cada canción siempre está abierto.
//  - Medio se abre con >= 1 estrella en Fácil; Difícil con >= 1 en Medio.
//  - La canción N+1 se abre con >= 1 estrella en el nivel Fácil de la canción N.
//  - La canción secreta solo se abre con el easter egg del logo.
// =====================================================================
import { NIVELES } from './niveles.js';
import { CANCIONES } from './canciones/index.js';
import { estrellasDe, obtenerSecretos } from './almacenamiento.js';

const normales = () => CANCIONES.filter((c) => !c.secreta);

export function nivelDesbloqueado(cancionId, nivelId) {
  const i = NIVELES.findIndex((n) => n.id === nivelId);
  if (i <= 0) return true;
  return estrellasDe(cancionId, NIVELES[i - 1].id) >= 1;
}

export function cancionDesbloqueada(cancionId) {
  const cancion = CANCIONES.find((c) => c.id === cancionId);
  if (cancion?.secreta) return !!obtenerSecretos().cancionSecreta;
  const lista = normales();
  const i = lista.findIndex((c) => c.id === cancionId);
  if (i <= 0) return true;
  return estrellasDe(lista[i - 1].id, 'facil') >= 1;
}

/** Canciones visibles en la lista (la secreta aparece solo si ya se desbloqueó). */
export const cancionesVisibles = () => CANCIONES.filter((c) => !c.secreta || obtenerSecretos().cancionSecreta);

export function estrellasDeCancion(cancionId) {
  return NIVELES.reduce((s, n) => s + estrellasDe(cancionId, n.id), 0);
}
export const estrellasTotales = () => CANCIONES.reduce((s, c) => s + estrellasDeCancion(c.id), 0);
export const estrellasPosibles = () => CANCIONES.filter((c) => !c.secreta).length * NIVELES.length * 3;

/** Devuelve el siguiente nivel/canción para ofrecer "Siguiente" tras ganar, o null. */
export function siguienteDe(cancionId, nivelId) {
  const i = NIVELES.findIndex((n) => n.id === nivelId);
  if (i < NIVELES.length - 1 && nivelDesbloqueado(cancionId, NIVELES[i + 1].id)) {
    return { cancionId, nivelId: NIVELES[i + 1].id };
  }
  const cancion = CANCIONES.find((c) => c.id === cancionId);
  if (!cancion?.secreta) {
    const lista = normales();
    const j = lista.findIndex((c) => c.id === cancionId);
    const sig = lista[j + 1];
    if (sig && cancionDesbloqueada(sig.id)) return { cancionId: sig.id, nivelId: 'facil' };
  }
  return null;
}
