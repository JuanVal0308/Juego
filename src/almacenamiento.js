// =====================================================================
// almacenamiento.js
// Persistencia de datos entre pantallas y entre sesiones usando
// localStorage. Todo el progreso del jugador vive en UNA sola clave
// JSON para que sea fácil de leer, probar y borrar.
// =====================================================================

const CLAVE = 'notaflow:v1';
const MAX_RANKING = 30; // cuántos puntajes se conservan en el ranking local

/** Datos por defecto cuando el jugador abre la app por primera vez. */
function datosIniciales() {
  return {
    version: 1,
    nombre: '',
    ajustes: {
      sonido: true,       // efectos y música
      vibracion: true,    // vibración al tocar
      volumen: 0.8,       // 0..1
      arcoiris: false,    // modo arcoíris (easter egg)
      tema: 'neon',       // 'neon' | 'solar'
    },
    // progreso[cancionId][nivelId] = { puntaje, estrellas, combo, precision, intentos }
    progreso: {},
    ranking: [],          // [{ nombre, cancion, nivel, puntaje, estrellas, fecha }]
    secretos: { cancionSecreta: false, confeti: false },
    estadisticas: { partidas: 0, notasAcertadas: 0, toquesLogo: 0 },
  };
}

let datos = cargar();

/** Lee de localStorage; si no existe o está dañado, usa los valores por defecto. */
function cargar() {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return datosIniciales();
    const guardado = JSON.parse(crudo);
    // Se mezcla con los valores por defecto por si una versión nueva agrega campos.
    const base = datosIniciales();
    return {
      ...base,
      ...guardado,
      ajustes: { ...base.ajustes, ...(guardado.ajustes || {}) },
      secretos: { ...base.secretos, ...(guardado.secretos || {}) },
      estadisticas: { ...base.estadisticas, ...(guardado.estadisticas || {}) },
    };
  } catch (e) {
    console.warn('[almacenamiento] datos dañados, se reinician', e);
    return datosIniciales();
  }
}

/** Escribe el estado actual en localStorage. */
function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch (e) {
    console.warn('[almacenamiento] no se pudo guardar', e);
  }
}

// ---------- Jugador y ajustes ----------
export const obtenerNombre = () => datos.nombre;
export function guardarNombre(nombre) {
  datos.nombre = String(nombre || '').trim().slice(0, 14);
  guardar();
}

export const obtenerAjustes = () => datos.ajustes;
export function cambiarAjuste(clave, valor) {
  datos.ajustes[clave] = valor;
  guardar();
}

// ---------- Progreso por canción y nivel ----------
export function obtenerResultado(cancionId, nivelId) {
  return datos.progreso[cancionId]?.[nivelId] || null;
}

export const estrellasDe = (cancionId, nivelId) => obtenerResultado(cancionId, nivelId)?.estrellas || 0;

/**
 * Registra el resultado de una partida. Conserva el MEJOR puntaje y las
 * MÁS estrellas, y agrega la entrada al ranking local.
 * Devuelve { esRecord } para que la pantalla de resultados lo celebre.
 */
export function registrarPartida({ cancionId, nivelId, puntaje, estrellas, combo, precision, ganada }) {
  const previo = obtenerResultado(cancionId, nivelId);
  const nuevo = {
    puntaje: Math.max(previo?.puntaje || 0, puntaje),
    estrellas: Math.max(previo?.estrellas || 0, estrellas),
    combo: Math.max(previo?.combo || 0, combo),
    precision: Math.max(previo?.precision || 0, precision),
    intentos: (previo?.intentos || 0) + 1,
  };
  datos.progreso[cancionId] = { ...(datos.progreso[cancionId] || {}), [nivelId]: nuevo };

  datos.estadisticas.partidas += 1;
  if (ganada) {
    datos.ranking.push({
      nombre: datos.nombre || 'Jugador',
      cancion: cancionId, nivel: nivelId, puntaje, estrellas,
      fecha: new Date().toISOString(),
    });
    datos.ranking.sort((a, b) => b.puntaje - a.puntaje);
    datos.ranking = datos.ranking.slice(0, MAX_RANKING);
  }
  guardar();
  return { esRecord: puntaje > (previo?.puntaje || 0) };
}

export const obtenerRanking = () => datos.ranking.slice();

export function sumarNotasAcertadas(n) {
  datos.estadisticas.notasAcertadas += n;
  guardar();
}
export const obtenerEstadisticas = () => datos.estadisticas;

// ---------- Secretos (easter eggs) ----------
export const obtenerSecretos = () => datos.secretos;
export function desbloquearSecreto(clave) {
  if (datos.secretos[clave]) return false;
  datos.secretos[clave] = true;
  guardar();
  return true;
}
export function sumarToqueLogo() {
  datos.estadisticas.toquesLogo += 1;
  guardar();
  return datos.estadisticas.toquesLogo;
}

/** Borra TODO el progreso (botón en Ajustes). */
export function reiniciarTodo() {
  datos = datosIniciales();
  guardar();
}
