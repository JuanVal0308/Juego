// =====================================================================
// partida.js
// LÓGICA PURA del juego (sin dibujar ni sonar): tiempo, notas, aciertos,
// puntaje, combo, vida y estrellas. Al estar separada de la pantalla se
// puede probar fácilmente avanzando el reloj a mano (ver pruebas/e2e.py).
// =====================================================================
import { generarNivel, NUM_CARRILES } from '../niveles.js';

/** Tiempo de la cuenta atrás antes de empezar (3, 2, 1, ¡YA!). */
export const CUENTA_ATRAS_MS = 3000;

// Estados de una nota
export const PENDIENTE = 0;
export const ACERTADA = 1;
export const FALLADA = 2;

const PUNTOS = { perfecto: 100, bien: 60 };
const VIDA = { perfecto: 2, bien: 1 };

/** Multiplicador según el combo: x1, x2 (10), x3 (20), x4 (40). */
export function multiplicadorDe(combo) {
  if (combo >= 40) return 4;
  if (combo >= 20) return 3;
  if (combo >= 10) return 2;
  return 1;
}

/**
 * Crea una partida nueva.
 * @param {object} cancion  canción del catálogo
 * @param {string} nivelId  'facil' | 'medio' | 'dificil'
 * @param {object} escuchas funciones que la pantalla quiere enterarse:
 *   alJuicio({tipo, carril, nota}), alCombo(mult), alFin(resultado), alTick...
 */
export function crearPartida(cancion, nivelId, escuchas = {}) {
  const armado = generarNivel(cancion, nivelId);
  const { nivel, notas } = armado;

  const p = {
    cancion, nivel, notas, fondo: armado.fondo,
    totalNotas: armado.totalNotas,
    duracionMs: armado.duracionMs,
    estado: 'jugando',         // 'jugando' | 'pausa' | 'fin'
    tiempo: -CUENTA_ATRAS_MS,  // ms de la canción (negativo durante la cuenta atrás)
    puntaje: 0,
    combo: 0,
    mejorCombo: 0,
    multiplicador: 1,
    vida: 100,
    perfectos: 0, bien: 0, fallos: 0,
    ganada: false,
    resultado: null,
    _restoFin: null,           // cuenta regresiva para cerrar la partida tras la última nota
  };

  const avisar = (nombre, dato) => escuchas[nombre]?.(dato);

  /** Aplica un juicio (perfecto/bien/fallo) a puntaje, combo y vida. */
  function juzgar(tipo, nota) {
    if (tipo === 'fallo') {
      p.fallos += 1;
      p.combo = 0;
      p.vida = Math.max(0, p.vida - nivel.danoFallo);
    } else {
      if (tipo === 'perfecto') p.perfectos += 1; else p.bien += 1;
      p.combo += 1;
      p.mejorCombo = Math.max(p.mejorCombo, p.combo);
      p.puntaje += PUNTOS[tipo] * p.multiplicador;
      p.vida = Math.min(100, p.vida + VIDA[tipo]);
    }
    const nuevoMult = multiplicadorDe(p.combo);
    if (nuevoMult !== p.multiplicador) {
      const subio = nuevoMult > p.multiplicador;
      p.multiplicador = nuevoMult;
      if (subio) avisar('alCombo', nuevoMult);
    }
    avisar('alJuicio', { tipo, carril: nota.carril, nota });
    if (p.vida <= 0) terminar(false);
  }

  /** El jugador toca un carril. Busca la nota pendiente más cercana dentro de la ventana "Bien". */
  p.pulsar = function pulsar(carril) {
    if (p.estado !== 'jugando') return null;
    let mejor = null;
    let mejorDif = Infinity;
    for (const n of p.notas) {
      if (n.estado !== PENDIENTE || n.carril !== carril) continue;
      const dif = Math.abs(n.t - p.tiempo);
      if (dif <= nivel.ventanaBienMs && dif < mejorDif) { mejor = n; mejorDif = dif; }
      if (n.t - p.tiempo > nivel.ventanaBienMs) break; // las notas están ordenadas por tiempo
    }
    if (!mejor) { avisar('alToqueVacio', { carril }); return null; } // toque sin nota: no castiga
    mejor.estado = ACERTADA;
    const tipo = mejorDif <= nivel.ventanaPerfectoMs ? 'perfecto' : 'bien';
    juzgar(tipo, mejor);
    return { tipo, nota: mejor, diferencia: p.tiempo - mejor.t };
  };

  /** Avanza el reloj `dt` milisegundos y procesa notas que ya pasaron sin tocarse. */
  p.avanzar = function avanzar(dt) {
    if (p.estado !== 'jugando') return;
    p.tiempo += dt;
    for (const n of p.notas) {
      if (n.estado === PENDIENTE && p.tiempo - n.t > nivel.ventanaBienMs) {
        n.estado = FALLADA;
        juzgar('fallo', n);
        if (p.estado !== 'jugando') return;
      }
      if (n.t - p.tiempo > nivel.tiempoCaidaMs) break;
    }
    // ¿Ya se resolvieron todas las notas? Se espera un instante y se termina.
    if (p._restoFin === null && p.notas.every((n) => n.estado !== PENDIENTE)) p._restoFin = 1200;
    if (p._restoFin !== null) {
      p._restoFin -= dt;
      if (p._restoFin <= 0) terminar(true);
    }
  };

  p.pausar = () => { if (p.estado === 'jugando') p.estado = 'pausa'; };
  p.reanudar = () => { if (p.estado === 'pausa') p.estado = 'jugando'; };

  /** Porcentaje de acierto 0..1 (Perfecto cuenta completo, Bien cuenta 60 %). */
  p.precision = () => (p.totalNotas ? (p.perfectos + p.bien * 0.6) / p.totalNotas : 0);

  /** Estrellas: 0 si se perdió; 1 (>=50 %), 2 (>=75 %), 3 (>=90 %). */
  p.estrellas = () => {
    if (!p.ganada) return 0;
    const pr = p.precision();
    return pr >= 0.9 ? 3 : pr >= 0.75 ? 2 : pr >= 0.5 ? 1 : 0;
  };

  function terminar(ganada) {
    if (p.estado === 'fin') return;
    p.estado = 'fin';
    p.ganada = ganada;
    p.resultado = {
      ganada,
      puntaje: p.puntaje,
      estrellas: p.estrellas(),
      combo: p.mejorCombo,
      precision: p.precision(),
      perfectos: p.perfectos, bien: p.bien, fallos: p.fallos,
      totalNotas: p.totalNotas,
      sinFallos: p.fallos === 0,
    };
    avisar('alFin', p.resultado);
  }

  /** Abandonar la partida (botón "Salir" del menú de pausa). */
  p.abandonar = () => { p.estado = 'fin'; };

  p.NUM_CARRILES = NUM_CARRILES;
  return p;
}
