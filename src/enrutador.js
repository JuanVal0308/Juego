// =====================================================================
// enrutador.js
// Navegación entre pantallas (SPA). Cada pantalla es un módulo con la
// forma { montar(contenedor, params, nav) -> funcionDestruir? }.
// El enrutador se encarga de las animaciones de entrada/salida y de
// mantener una pila para el botón "atrás".
// =====================================================================

const pantallas = new Map(); // nombre -> módulo de pantalla
const pila = [];             // historial de { nombre, params }
let actual = null;           // { nombre, params, elemento, destruir }

const DURACION_SALIDA = 240; // ms, debe coincidir con la animación .sale

export function registrarPantalla(nombre, modulo) {
  pantallas.set(nombre, modulo);
}

export const pantallaActual = () => actual?.nombre || null;

/**
 * Muestra una pantalla.
 * @param {string} nombre  nombre registrado
 * @param {object} params  datos para la pantalla (p. ej. cancion y nivel)
 * @param {object} opciones { reemplazar: true no guarda la actual en la pila,
 *                            atras: true usa animación de retroceso }
 */
export function irA(nombre, params = {}, opciones = {}) {
  const modulo = pantallas.get(nombre);
  if (!modulo) throw new Error(`Pantalla desconocida: ${nombre}`);
  const contenedor = document.getElementById('app');

  // Se guarda la pantalla anterior en la pila para poder volver.
  if (actual && !opciones.reemplazar && !opciones.atras) {
    pila.push({ nombre: actual.nombre, params: actual.params });
  }

  const anterior = actual;
  const elemento = document.createElement('section');
  elemento.className = `pantalla pantalla-${nombre} ${opciones.atras ? 'entra-atras' : 'entra'}`;
  elemento.dataset.pantalla = nombre;
  contenedor.appendChild(elemento);

  const destruir = modulo.montar(elemento, params, { irA, volver }) || null;
  actual = { nombre, params, elemento, destruir };

  if (anterior) retirar(anterior);
}

/** Retira una pantalla con animación y libera sus recursos. */
function retirar(pantalla) {
  try { pantalla.destruir?.(); } catch (e) { console.warn('[enrutador] error al destruir', e); }
  pantalla.elemento.classList.remove('entra', 'entra-atras');
  pantalla.elemento.classList.add('sale');
  setTimeout(() => pantalla.elemento.remove(), DURACION_SALIDA);
}

/** Vuelve a la pantalla anterior de la pila. Devuelve false si no hay. */
export function volver() {
  const previa = pila.pop();
  if (!previa) return false;
  irA(previa.nombre, previa.params, { atras: true });
  return true;
}

/** Vacía el historial (útil al regresar al menú principal). */
export function limpiarPila() {
  pila.length = 0;
}
