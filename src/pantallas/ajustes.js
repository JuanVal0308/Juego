// =====================================================================
// ajustes.js - Ajustes de sonido, vibración, nombre y borrado de datos.
// Todo se guarda al instante en localStorage (persistencia).
// =====================================================================
import { obtenerAjustes, cambiarAjuste, obtenerNombre, guardarNombre, reiniciarTodo, obtenerSecretos } from '../almacenamiento.js';
import { actualizarVolumen, sonidoClic, sonidoAtras, sonidoAjustes, iniciarAudio, tocarNota } from '../audio.js';
import { vibrar } from '../vibracion.js';
import { aviso, esc } from '../util/dom.js';

export default {
  montar(el, _params, nav) {
    const a = obtenerAjustes();
    const hayArcoiris = obtenerSecretos().cancionSecreta;
    iniciarAudio();
    sonidoAjustes();
    el.innerHTML = `
      <div class="barra-superior">
        <button class="boton suave boton-icono" id="atras" aria-label="Volver">←</button>
        <h2 class="titulo">Ajustes</h2>
      </div>
      <div class="lista-ajustes">
        <div class="tarjeta ajuste">
          <div><b>Sonido</b><small>Música y efectos</small></div>
          <button class="interruptor" id="sw-sonido" role="switch" aria-checked="${a.sonido}" aria-label="Sonido"></button>
        </div>
        <div class="tarjeta">
          <div class="ajuste"><div><b>Volumen</b><small id="txt-volumen">${Math.round(a.volumen * 100)} %</small></div></div>
          <input type="range" id="rango-volumen" min="0" max="100" value="${Math.round(a.volumen * 100)}" aria-label="Volumen" />
        </div>
        <div class="tarjeta ajuste">
          <div><b>Vibración</b><small>Al tocar las notas</small></div>
          <button class="interruptor" id="sw-vibracion" role="switch" aria-checked="${a.vibracion}" aria-label="Vibración"></button>
        </div>
        ${hayArcoiris ? `
        <div class="tarjeta ajuste">
          <div><b>🌈 Modo arcoíris</b><small>Notas de colores cambiantes</small></div>
          <button class="interruptor" id="sw-arcoiris" role="switch" aria-checked="${a.arcoiris}" aria-label="Modo arcoíris"></button>
        </div>` : ''}
        <div class="tarjeta">
          <div class="ajuste"><div><b>Tu nombre</b><small>Aparece en el ranking</small></div></div>
          <div class="fila-entrada" style="margin-top:10px">
            <input class="entrada" id="entrada-nombre" maxlength="14" value="${esc(obtenerNombre())}" placeholder="Tu nombre" autocomplete="off" />
            <button class="boton cian peque" id="guardar-nombre">Guardar</button>
          </div>
        </div>
        <!-- TODO(equipo): Integrante 3 agrega aquí la opción "Tema de color" (ver TAREAS_EQUIPO.md) -->
        <button class="boton suave" id="borrar" style="color:var(--rojo)">Borrar todo mi progreso</button>
      </div>`;

    const $ = (s) => el.querySelector(s);
    $('#atras').onclick = () => { sonidoAtras(); nav.volver(); };

    /** Conecta un interruptor con una clave de ajustes. */
    const interruptor = (id, clave) => {
      const sw = $(id);
      if (!sw) return;
      sw.onclick = () => {
        iniciarAudio();
        const nuevo = sw.getAttribute('aria-checked') !== 'true';
        sw.setAttribute('aria-checked', String(nuevo));
        cambiarAjuste(clave, nuevo);
        actualizarVolumen();
        sonidoClic();
        if (clave === 'vibracion' && nuevo) vibrar('victoria');
      };
    };
    interruptor('#sw-sonido', 'sonido');
    interruptor('#sw-vibracion', 'vibracion');
    interruptor('#sw-arcoiris', 'arcoiris');

    $('#rango-volumen').oninput = (e) => {
      const v = Number(e.target.value) / 100;
      cambiarAjuste('volumen', v);
      $('#txt-volumen').textContent = `${e.target.value} %`;
      iniciarAudio(); actualizarVolumen();
    };
    $('#rango-volumen').onchange = () => tocarNota(659.25, 'piano', null, 0.4); // prueba de volumen

    $('#guardar-nombre').onclick = () => {
      const v = $('#entrada-nombre').value.trim();
      if (!v) { aviso('Escribe un nombre'); return; }
      guardarNombre(v); sonidoClic(); aviso('Nombre guardado ✓');
    };

    let confirmando = false;
    $('#borrar').onclick = () => {
      if (!confirmando) {
        confirmando = true;
        $('#borrar').textContent = 'Toca de nuevo para confirmar';
        setTimeout(() => { confirmando = false; const b = $('#borrar'); if (b) b.textContent = 'Borrar todo mi progreso'; }, 3000);
        return;
      }
      reiniciarTodo(); actualizarVolumen();
      aviso('Progreso borrado');
      nav.irA('home', {}, { reemplazar: true });
    };
  },
};
