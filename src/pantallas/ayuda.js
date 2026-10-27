// =====================================================================
// ayuda.js - Pantalla "Cómo jugar"
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
        <div class="paso"><span class="num">1</span><p>Mira los <b>4 carriles</b> y sigue las notas que bajan.</p></div>
        <div class="paso"><span class="num">2</span><p>Toca un carril cuando su nota cruce la <b>línea brillante</b>.</p></div>
        <div class="paso"><span class="num">3</span><p>Un toque preciso da <b>Perfecto</b>; uno cercano da <b>Bien</b>.</p></div>
        <div class="paso"><span class="num">4</span><p>Evita los fallos: cada uno reduce tu <b>vida</b>.</p></div>
        <div class="paso"><span class="num">5</span><p>Obtén al menos <b>1 estrella</b> para desbloquear contenido.</p></div>
        <div class="paso"><span class="num">6</span><p>En computador usa <b>D · F · J · K</b>. Pulsa <b>⏸</b> para pausar.</p></div>
        <div class="paso"><span class="num">7</span><p>Explora la pantalla principal: el logo guarda un secreto. 🌈</p></div>
      </div>`;
    el.querySelector('#atras').onclick = () => { sonidoAtras(); nav.volver(); };
  },
};
