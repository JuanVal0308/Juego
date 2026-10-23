// =====================================================================
// ayuda.js - Pantalla "Cómo jugar"
// TODO(equipo): Integrante 2 redacta y mejora estos textos
// (ver TAREAS_EQUIPO.md, tarea "Cómo jugar").
// =====================================================================
import { sonidoAtras } from '../audio.js';
import { COLORES_CARRIL } from '../motor/dibujo.js';

export default {
  montar(el, _params, nav) {
    el.innerHTML = `
      <div class="barra-superior">
        <button class="boton suave boton-icono" id="atras" aria-label="Volver">←</button>
        <h2 class="titulo">Cómo jugar</h2>
      </div>
      <div class="demo-carriles">${COLORES_CARRIL.map((c) => `<i style="--c:${c}"></i>`).join('')}</div>
      <div class="tarjeta ayuda-pasos">
        <div class="paso"><span class="num">1</span><p>Las notas <b>caen</b> por 4 carriles. Toca el carril cuando la nota llegue a la <b>línea brillante</b>.</p></div>
        <div class="paso"><span class="num">2</span><p>Mientras más exacto, mejor: <b>¡Perfecto!</b>, <b>Bien</b> o <b>Fallo</b>.</p></div>
        <div class="paso"><span class="num">3</span><p>Encadena aciertos para subir el <b>combo</b> y multiplicar el puntaje hasta <b>x4</b>.</p></div>
        <div class="paso"><span class="num">4</span><p>Cada fallo baja tu <b>barra de vida</b>. Si llega a cero, pierdes la canción.</p></div>
        <div class="paso"><span class="num">5</span><p>Consigue <b>★ 1 estrella</b> para abrir el siguiente nivel o canción. ¡Hay 3 niveles por canción!</p></div>
        <div class="paso"><span class="num">6</span><p>En computador usa las teclas <b>D · F · J · K</b>. Toca el botón <b>⏸</b> para pausar.</p></div>
        <div class="paso"><span class="num">7</span><p>Psst… dicen que el logo de la pantalla principal esconde un secreto. 🌈</p></div>
      </div>`;
    el.querySelector('#atras').onclick = () => { sonidoAtras(); nav.volver(); };
  },
};
