// =====================================================================
// puntajes.js - Pantalla: Ranking local y mejores marcas por canción
// Lee todo desde localStorage (persistencia entre pantallas y sesiones).
// =====================================================================
import { obtenerRanking, obtenerResultado } from '../almacenamiento.js';
import { cancionPorId, CANCIONES } from '../canciones/index.js';
import { NIVELES, nivelPorId } from '../niveles.js';
import { cancionesVisibles } from '../progreso.js';
import { sonidoAtras, sonidoClic } from '../audio.js';
import { esc, miles, estrellasTexto } from '../util/dom.js';

export default {
  montar(el, _params, nav) {
    el.innerHTML = `
      <div class="barra-superior">
        <button class="boton suave boton-icono" id="atras" aria-label="Volver">←</button>
        <h2 class="titulo">Puntajes</h2>
      </div>
      <div class="pestanas">
        <button class="boton suave activa" data-tab="ranking">🏆 Ranking</button>
        <button class="boton suave" data-tab="mejores">★ Mis mejores</button>
      </div>
      <div id="contenido"></div>`;
    const $ = (s) => el.querySelector(s);

    function verRanking() {
      const lista = obtenerRanking();
      if (!lista.length) {
        return `<div class="vacio"><span class="grande">🎸</span>Aún no hay puntajes.<br>¡Termina una canción para aparecer aquí!</div>`;
      }
      return `<div class="tabla">${lista.map((f, i) => {
        const c = cancionPorId(f.cancion);
        const fecha = new Date(f.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
        return `<div class="fila-rank">
          <span class="pos">${i + 1}</span>
          <span class="quien"><b>${esc(f.nombre)}</b><small>${esc(c?.titulo || f.cancion)} · ${nivelPorId(f.nivel)?.nombre || f.nivel} · ${fecha}</small></span>
          <span class="pts">${miles(f.puntaje)}<small>${estrellasTexto(f.estrellas)}</small></span>
        </div>`;
      }).join('')}</div>`;
    }

    function verMejores() {
      return cancionesVisibles().map((c) => `
        <div class="mejores-grupo">
          <h3>${esc(c.titulo)}</h3>
          <div class="mejores-niveles">
            ${NIVELES.map((n) => {
              const r = obtenerResultado(c.id, n.id);
              return `<div class="mejor-nivel"><b>${n.nombre}</b>${r ? `${miles(r.puntaje)}<div class="estrellas">${estrellasTexto(r.estrellas)}</div>` : '—'}</div>`;
            }).join('')}
          </div>
        </div>`).join('');
    }

    const mostrar = (tab) => {
      $('#contenido').innerHTML = tab === 'ranking' ? verRanking() : verMejores();
      el.querySelectorAll('.pestanas .boton').forEach((b) => b.classList.toggle('activa', b.dataset.tab === tab));
    };
    mostrar('ranking');
    el.querySelectorAll('.pestanas .boton').forEach((b) => { b.onclick = () => { sonidoClic(); mostrar(b.dataset.tab); }; });
    $('#atras').onclick = () => { sonidoAtras(); nav.volver(); };
  },
};
