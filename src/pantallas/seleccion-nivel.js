// =====================================================================
// seleccion-nivel.js - Pantalla: elegir Fácil / Medio / Difícil
// Muestra mejor puntaje y estrellas de cada nivel guardados en localStorage.
// =====================================================================
import { cancionPorId } from '../canciones/index.js';
import { NIVELES, resumenNivel } from '../niveles.js';
import { nivelDesbloqueado } from '../progreso.js';
import { obtenerResultado } from '../almacenamiento.js';
import { sonidoClic, sonidoAtras, sonidoFallo } from '../audio.js';
import { vibrar } from '../vibracion.js';
import { aviso, esc, miles, estrellasTexto } from '../util/dom.js';

const VELOCIDAD = { facil: 'Lenta', medio: 'Media', dificil: 'Rápida' };

export default {
  montar(el, { cancionId }, nav) {
    const c = cancionPorId(cancionId);
    const filas = NIVELES.map((n, i) => {
      const abierto = nivelDesbloqueado(c.id, n.id);
      const r = obtenerResultado(c.id, n.id);
      const resumen = resumenNivel(c, n.id);
      return `
        <button class="nivel ${abierto ? '' : 'bloqueado'}" data-nivel="${n.id}" style="--color:${n.color}; --i:${i}">
          <span class="insignia"></span>
          <span class="info">
            <b>${n.nombre}</b>
            <small>${resumen.totalNotas} notas · velocidad ${VELOCIDAD[n.id]}</small>
            <small>${abierto ? (r ? `Mejor: ${miles(r.puntaje)} pts · combo ${r.combo}` : 'Sin jugar todavía') : '🔒 Consigue ★ en el nivel anterior'}</small>
          </span>
          <span class="estrellas">${abierto ? estrellasTexto(r?.estrellas || 0) : '🔒'}</span>
        </button>`;
    }).join('');

    el.style.setProperty('--color', c.secreta ? '#ff2bd6' : c.color);
    el.innerHTML = `
      <div class="barra-superior">
        <button class="boton suave boton-icono" id="atras" aria-label="Volver">←</button>
        <h2 class="titulo">Nivel</h2>
      </div>
      <div class="cabecera-cancion">
        <div class="disco-grande"></div>
        <h2 style="font-size:1.4rem">${esc(c.titulo)}</h2>
        <p class="subtitulo">${esc(c.descripcion)}</p>
      </div>
      <div class="lista-niveles">${filas}</div>
      <p class="nota-pie">Consigue al menos ★ 1 estrella para abrir el siguiente nivel.</p>`;

    el.querySelector('#atras').onclick = () => { sonidoAtras(); nav.volver(); };
    el.querySelectorAll('.nivel').forEach((b) => {
      b.onclick = () => {
        const nivelId = b.dataset.nivel;
        if (!nivelDesbloqueado(c.id, nivelId)) { vibrar('fallo'); sonidoFallo(); aviso('🔒 Supera el nivel anterior con ★'); return; }
        sonidoClic(); vibrar('clic');
        nav.irA('juego', { cancionId: c.id, nivelId });
      };
    });
  },
};
