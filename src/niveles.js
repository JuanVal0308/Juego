// =====================================================================
// niveles.js
// A partir de la melodía de una canción GENERA las notas que caen en
// pantalla para cada nivel (Fácil / Medio / Difícil).
//
// Cómo funciona (explicado para que el código sea fácil de defender):
//  1. La melodía son pares [nota, pulsos]. Con el BPM se pasa a milisegundos.
//  2. Cada nota se asigna a uno de los 4 carriles según su altura:
//     los sonidos más graves van a la izquierda y los agudos a la derecha.
//  3. Cada nivel FILTRA o AGREGA notas: Fácil deja pocas, Difícil deja todas
//     y añade acordes (2 notas a la vez) y notas "adorno" repetidas.
//  4. Además cada nivel define la velocidad de caída y qué tan estricto es.
//  5. También se arma el acompañamiento (bajo y batería) en milisegundos.
// =====================================================================
import { notaAMidi, notaAFrecuencia, crearAleatorio, semillaDeTexto } from './util/musica.js';
import { CANCIONES } from './canciones/index.js';

/** Tiempo (ms) desde que arranca la canción hasta su primer pulso. Da margen para la cuenta atrás. */
export const DESFASE_MS = 1500;
export const NUM_CARRILES = 4;

/**
 * Parámetros de cada nivel.
 * TODO(equipo): Integrante 2 puede afinar estos números (dificultad) y
 * anotar en el commit qué cambió y por qué (ver TAREAS_EQUIPO.md).
 */
export const NIVELES = [
  {
    id: 'facil', nombre: 'Fácil', color: '#4dff9a',
    tiempoCaidaMs: 2300,     // cuánto tarda una nota en caer (más tiempo = más lento)
    huecoMinimoMs: 400,      // separación mínima entre notas
    soloTiemposFuertes: true,// solo notas que caen en pulso o medio pulso (o largas)
    probAcorde: 0,           // probabilidad de agregar una segunda nota simultánea
    adornos: false,          // divide notas largas en dos golpes
    ventanaPerfectoMs: 85,   // margen para "Perfecto"
    ventanaBienMs: 170,      // margen para "Bien"
    danoFallo: 6,            // vida que se pierde por fallo (de 100)
  },
  {
    id: 'medio', nombre: 'Medio', color: '#ffd84a',
    tiempoCaidaMs: 1850,
    huecoMinimoMs: 190,
    soloTiemposFuertes: false,
    probAcorde: 0.1,
    adornos: false,
    ventanaPerfectoMs: 70,
    ventanaBienMs: 145,
    danoFallo: 8,
  },
  {
    id: 'dificil', nombre: 'Difícil', color: '#ff4d6d',
    tiempoCaidaMs: 1450,
    huecoMinimoMs: 100,
    soloTiemposFuertes: false,
    probAcorde: 0.28,
    adornos: true,
    ventanaPerfectoMs: 55,
    ventanaBienMs: 120,
    danoFallo: 10,
  },
];

export const nivelPorId = (id) => NIVELES.find((n) => n.id === id);

// ---------------------------------------------------------------------
// Acompañamiento: patrones de batería por estilo ("ritmo" de la canción)
// ---------------------------------------------------------------------
/** Cada patrón dice qué suena en cada pulso del compás de 4 tiempos. */
function eventosBateria(ritmo, pulso) {
  const tiempo = pulso % 4;  // 0,1,2,3 dentro del compás
  const ev = [];
  const entero = Number.isInteger(pulso);
  switch (ritmo) {
    case 'electro': // bombo en todos los tiempos, caja en 2 y 4, hi-hat abierto a contratiempo
      if (entero) ev.push('bombo');
      if (entero && (tiempo === 1 || tiempo === 3)) ev.push('caja');
      if (!entero) ev.push('hihatAbierto');
      break;
    case 'rock':
      if (entero && (tiempo === 0 || tiempo === 2)) ev.push('bombo');
      if (pulso % 4 === 1.5) ev.push('bombo');
      if (entero && (tiempo === 1 || tiempo === 3)) ev.push('caja');
      ev.push('hihat');
      break;
    case 'pop':
      if (entero && (tiempo === 0 || tiempo === 2)) ev.push('bombo');
      if (entero && (tiempo === 1 || tiempo === 3)) ev.push('caja');
      ev.push('hihat');
      break;
    default: // 'suave'
      if (entero && tiempo === 0) ev.push('bombo');
      if (entero && (tiempo === 1 || tiempo === 3)) ev.push('hihat');
  }
  return ev;
}

/** Arma la lista de eventos de acompañamiento (bajo + batería) en milisegundos. */
function generarFondo(cancion, totalPulsos) {
  const msPulso = 60000 / cancion.bpm;
  const fondo = [];
  // Batería: subdivisiones de medio pulso (corcheas)
  for (let p = 0; p < totalPulsos; p += 0.5) {
    for (const tipo of eventosBateria(cancion.ritmo, p)) {
      // El hi-hat de ritmos "pop/rock" solo suena en corcheas; en los demás sólo si lo pide el patrón
      fondo.push({ t: DESFASE_MS + p * msPulso, tipo });
    }
  }
  // Bajo: notas largas graves
  let pulso = 0;
  for (const [nota, dur] of cancion.bajo || []) {
    const freq = notaAFrecuencia(nota);
    if (freq) fondo.push({ t: DESFASE_MS + pulso * msPulso, tipo: 'bajo', freq, dur: Math.min(dur * msPulso / 1000, 1.2) });
    pulso += dur;
  }
  return fondo.sort((a, b) => a.t - b.t);
}

// ---------------------------------------------------------------------
// Generación de notas
// ---------------------------------------------------------------------
const cache = new Map();

/**
 * Devuelve el "nivel armado": { notas, fondo, duracionMs, totalNotas, nivel, cancion }
 * Cada nota: { id, t (ms), carril (0-3), freq, estado }
 */
export function generarNivel(cancion, nivelId) {
  const clave = `${cancion.id}:${nivelId}`;
  if (cache.has(clave)) return clone(cache.get(clave));

  const nivel = nivelPorId(nivelId);
  const msPulso = 60000 / cancion.bpm;
  const aleatorio = crearAleatorio(semillaDeTexto(clave)); // misma canción+nivel = mismas notas siempre

  // 1) Pasar la melodía a una lista de notas con tiempo en pulsos
  const crudas = [];
  let pulso = 0;
  for (const [nombre, dur] of cancion.melodia) {
    const midi = notaAMidi(nombre);
    if (midi !== null) crudas.push({ pulso, dur, midi, freq: notaAFrecuencia(nombre) });
    pulso += dur;
  }
  const totalPulsos = pulso;

  // 2) Mapa altura -> carril: las notas se reparten en 4 grupos con CANTIDAD PARECIDA
  //    de notas (por cuantiles), así ningún carril queda casi vacío.
  const ordenadas = crudas.map((n) => n.midi).sort((a, b) => a - b);
  const cortes = [1, 2, 3].map((k) => ordenadas[Math.floor((ordenadas.length * k) / NUM_CARRILES)]);
  const carrilDe = (midi) => cortes.filter((corte) => midi >= corte).length;

  // 3) Filtrar según el nivel
  let candidatas = crudas;
  if (nivel.soloTiemposFuertes) candidatas = candidatas.filter((n) => n.pulso % 0.5 === 0 || n.dur >= 1);
  const conservadas = [];
  let ultimoT = -Infinity;
  for (const n of candidatas) {
    const t = DESFASE_MS + n.pulso * msPulso;
    if (t - ultimoT >= nivel.huecoMinimoMs - 1) { // -1 por redondeos
      conservadas.push({ ...n, t });
      ultimoT = t;
    }
  }

  // 4) Construir notas finales (con acordes y adornos para los niveles altos)
  const notas = [];
  const agregar = (t, carril, freq) => notas.push({ t: Math.round(t), carril, freq, estado: 0 });
  for (const n of conservadas) {
    const carril = carrilDe(n.midi);
    agregar(n.t, carril, n.freq);
    // Acorde: una segunda nota a la vez, en otro carril, una tercera mayor más aguda
    if (n.dur >= 1 && aleatorio() < nivel.probAcorde) {
      const otro = (carril + 1 + Math.floor(aleatorio() * (NUM_CARRILES - 1))) % NUM_CARRILES;
      agregar(n.t, otro, n.freq * Math.pow(2, 4 / 12));
    }
    // Adorno: las notas largas se repiten a la mitad de su duración
    if (nivel.adornos && n.dur >= 1.5) {
      agregar(n.t + (n.dur * msPulso) / 2, carril, n.freq);
    }
  }
  notas.sort((a, b) => a.t - b.t || a.carril - b.carril);
  notas.forEach((n, i) => { n.id = i; });

  const resultado = {
    cancion, nivel, notas,
    fondo: generarFondo(cancion, totalPulsos),
    totalNotas: notas.length,
    duracionMs: DESFASE_MS + totalPulsos * msPulso + 1200,
  };
  cache.set(clave, resultado);
  return clone(resultado);
}

/** Copia las notas para que cada partida empiece con estados limpios. */
function clone(r) {
  return { ...r, notas: r.notas.map((n) => ({ ...n, estado: 0 })) };
}

/** Resumen ligero para mostrar en la selección de nivel. */
export function resumenNivel(cancion, nivelId) {
  const n = generarNivel(cancion, nivelId);
  const segundos = Math.round(n.duracionMs / 1000);
  return { totalNotas: n.totalNotas, segundos };
}

/** Todas las canciones normales (sin la secreta), en orden de desbloqueo. */
export const cancionesNormales = () => CANCIONES.filter((c) => !c.secreta);
