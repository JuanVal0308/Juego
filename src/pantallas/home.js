// =====================================================================
// home.js - Pantalla 2: Menú principal
// Incluye el EASTER EGG #1: tocar el logo 7 veces desbloquea la canción
// secreta "Arcoíris" y activa el modo arcoíris.
// =====================================================================
import { logoSVG, tituloLetras, ecualizador } from '../util/logo.js';
import { obtenerNombre, guardarNombre, desbloquearSecreto, sumarToqueLogo, cambiarAjuste, obtenerSecretos } from '../almacenamiento.js';
import { estrellasTotales, estrellasPosibles } from '../progreso.js';
import { sonidoClic, sonidoToqueLogo, sonidoSecreto, iniciarAudio } from '../audio.js';
import { vibrar } from '../vibracion.js';
import { aviso, esc } from '../util/dom.js';
import { lanzarConfeti } from '../util/confeti.js';
import { obtenerAjustes } from '../almacenamiento.js';

const TOQUES_SECRETO = 7;

export default {
  montar(el, _params, nav) {
    const nombre = obtenerNombre();
    el.innerHTML = `
      <div class="home-superior">
        <span class="chip" id="chip-estrellas">★ <b>${estrellasTotales()}</b> / ${estrellasPosibles()}</span>
        <button class="boton suave boton-icono" id="btn-ajustes" aria-label="Ajustes">⚙</button>
      </div>
      <div class="home-logo ${obtenerAjustes().arcoiris ? 'arcoiris' : ''}" id="logo" role="button" aria-label="Logo NotaFlow">${logoSVG(112)}</div>
      <h1 class="titulo home-titulo">NotaFlow</h1>
      <p class="home-saludo" id="saludo">${nombre ? `¡Hola, ${esc(nombre)}!` : 'Bienvenido, ¿cómo te llamas?'}</p>

      ${nombre ? '' : `
      <div class="tarjeta tarjeta-nombre" id="tarjeta-nombre">
        <p>Escribe tu nombre para el ranking</p>
        <div class="fila-entrada">
          <input class="entrada" id="entrada-nombre" maxlength="14" placeholder="Tu nombre" autocomplete="off" />
          <button class="boton cian peque" id="btn-guardar-nombre">Guardar</button>
        </div>
      </div>`}

      <div class="home-botones">
        <button class="boton grande" id="btn-jugar">▶ Jugar</button>
        <div class="home-fila">
          <button class="boton cian" id="btn-puntajes">🏆 Puntajes</button>
          <button class="boton cian" id="btn-ayuda">❓ Cómo jugar</button>
        </div>
        <button class="boton suave" id="btn-creditos">Créditos</button>
      </div>
      ${ecualizador(7)}
      <p class="home-pie">v1.0.0 · Hecho en UPB</p>`;

    const $ = (id) => el.querySelector(id);
    const ir = (pantalla) => () => { iniciarAudio(); sonidoClic(); vibrar('clic'); nav.irA(pantalla); };
    $('#btn-jugar').onclick = ir('canciones');
    $('#btn-puntajes').onclick = ir('puntajes');
    $('#btn-ayuda').onclick = ir('ayuda');
    $('#btn-creditos').onclick = ir('creditos');
    $('#btn-ajustes').onclick = ir('ajustes');

    // ----- Guardar el nombre del jugador (persistencia) -----
    const guardar = $('#btn-guardar-nombre');
    if (guardar) {
      const confirmar = () => {
        const valor = $('#entrada-nombre').value.trim();
        if (!valor) { aviso('Escribe un nombre primero'); return; }
        guardarNombre(valor);
        sonidoClic();
        $('#saludo').textContent = `¡Hola, ${valor}!`;
        $('#tarjeta-nombre').remove();
      };
      guardar.onclick = confirmar;
      $('#entrada-nombre').addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmar(); });
    }

    // ----- EASTER EGG #1: 7 toques al logo -----
    let toques = 0;
    let temporizador = null;
    $('#logo').addEventListener('click', () => {
      iniciarAudio();
      const logo = $('#logo');
      logo.classList.remove('sacude'); void logo.offsetWidth; logo.classList.add('sacude');
      toques += 1;
      sumarToqueLogo();
      sonidoToqueLogo(toques);
      vibrar('toque');
      clearTimeout(temporizador);
      temporizador = setTimeout(() => { toques = 0; }, 1500); // los toques deben ser seguidos
      if (toques === TOQUES_SECRETO) {
        toques = 0;
        const nuevo = desbloquearSecreto('cancionSecreta');
        cambiarAjuste('arcoiris', true);
        logo.classList.add('arcoiris');
        sonidoSecreto();
        vibrar('victoria');
        lanzarConfeti(120);
        aviso(nuevo ? '🌈 ¡Canción secreta "Arcoíris" desbloqueada!' : '🌈 Modo arcoíris activado', 3200);
      }
    });
    return () => clearTimeout(temporizador);
  },
};
