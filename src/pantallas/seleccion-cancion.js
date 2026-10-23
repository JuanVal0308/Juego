// =====================================================================
// seleccion-cancion.js - Pantalla: elegir la canción
// Las canciones bloqueadas se muestran con candado y la condición para abrirlas.
// =====================================================================
import { cancionesVisibles, cancionDesbloqueada, estrellasDeCancion } from '../progreso.js';
import { CANCIONES } from '../canciones/index.js';
import { NIVELES } from '../niveles.js';
import { sonidoClic, sonidoAtras, sonidoFallo } from '../audio.js';
import { vibrar } from '../vibracion.js';
import { aviso, esc } from '../util/dom.js';

export default {
  montar(el, _params, nav) {
    const normales = CANCIONES.filter((c) => !c.secreta);
    const tarjetas = cancionesVisibles().map((c, i) => {
      const abierta = cancionDesbloqueada(c.id);
      const estrellas = estrellasDeCancion(c.id);
      const max = NIVELES.length * 3;
      const previa = normales[normales.indexOf(c) - 1];
      const pista = abierta
        ? `${esc(c.artista)} · ${c.bpm} BPM`
        : `🔒 Consigue ★ en Fácil de "${esc(previa?.titulo || '')}"`;
      return `
        <button class="cancion ${abierta ? '' : 'bloqueada'} ${c.secreta ? 'secreta' : ''}" data-id="${c.id}" style="--color:${c.secreta ? '#ff2bd6' : c.color}; --i:${i}">
          <span class="disco">${abierta ? '♪' : '🔒'}</span>
          <span class="info"><b>${esc(c.titulo)}</b><small>${pista}</small></span>
          <span class="estrellas">${abierta ? `★ ${estrellas}/${max}` : ''}</span>
        </button>`;
    }).join('');

    el.innerHTML = `
      <div class="barra-superior">
        <button class="boton suave boton-icono" id="atras" aria-label="Volver">←</button>
        <h2 class="titulo">Elige canción</h2>
      </div>
      <div class="lista-canciones">${tarjetas}</div>`;

    el.querySelector('#atras').onclick = () => { sonidoAtras(); nav.volver(); };
    el.querySelectorAll('.cancion').forEach((b) => {
      b.onclick = () => {
        const id = b.dataset.id;
        if (!cancionDesbloqueada(id)) { vibrar('fallo'); sonidoFallo(); aviso('🔒 Aún bloqueada: supera la canción anterior'); return; }
        sonidoClic(); vibrar('clic');
        nav.irA('niveles', { cancionId: id });
      };
    });
  },
};
