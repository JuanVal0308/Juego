// =====================================================================
// creditos.js - Pantalla: Créditos del equipo
// Incluye el EASTER EGG #2: tocar 5 veces "Hecho en UPB" lanza confeti.
// TODO(equipo): Integrante 3 reemplaza su nombre real aquí
// (ver TAREAS_EQUIPO.md).
// =====================================================================
import { sonidoAtras, sonidoSecreto, sonidoToqueLogo } from '../audio.js';
import { vibrar } from '../vibracion.js';
import { lanzarConfeti } from '../util/confeti.js';
import { aviso } from '../util/dom.js';
import { desbloquearSecreto } from '../almacenamiento.js';

// Integrantes del equipo
const EQUIPO = [
  { nombre: 'Juan Pablo Martinez Romero', rol: 'Motor del juego, audio y Android' },
  { nombre: 'Zteve0', rol: 'Canciones, niveles y textos' },
  { nombre: 'Integrante 3', rol: 'Documentación, tienda y pruebas' },
];

export default {
  montar(el, _params, nav) {
    el.innerHTML = `
      <div class="barra-superior">
        <button class="boton suave boton-icono" id="atras" aria-label="Volver">←</button>
        <h2 class="titulo">Créditos</h2>
      </div>
      <p class="subtitulo" style="text-align:center">NotaFlow · Entrega #4 · Aplicaciones móviles</p>
      <div class="creditos-lista">
        ${EQUIPO.map((m, i) => `
          <div class="tarjeta integrante" style="--i:${i}">
            <span class="avatar">${m.nombre[0]}</span>
            <span><b>${m.nombre}</b><small>${m.rol}</small></span>
          </div>`).join('')}
      </div>
      <div class="hecho-en" id="hecho-en" role="button">★ HECHO EN UPB ★</div>
      <p class="legal">
        Música: arreglos propios de obras de dominio público (Estrellita, Himno a la Alegría,
        Para Elisa, Cascabeles) y composiciones originales del equipo. Todos los sonidos se
        sintetizan por código con la Web Audio API.<br>Versión 1.0.0
      </p>`;
    el.querySelector('#atras').onclick = () => { sonidoAtras(); nav.volver(); };

    // EASTER EGG #2: 5 toques en "Hecho en UPB"
    let toques = 0, timer = null;
    el.querySelector('#hecho-en').onclick = () => {
      toques += 1; sonidoToqueLogo(toques); vibrar('toque');
      clearTimeout(timer); timer = setTimeout(() => { toques = 0; }, 1500);
      if (toques === 5) {
        toques = 0;
        desbloquearSecreto('confeti');
        sonidoSecreto(); vibrar('victoria'); lanzarConfeti(160, 4200);
        aviso('🎉 ¡Encontraste el secreto de UPB!', 3000);
      }
    };
    return () => clearTimeout(timer);
  },
};
