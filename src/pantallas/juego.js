// =====================================================================
// juego.js - Pantalla 3: Juego
// Une todas las piezas: la lógica (partida.js), el dibujo (dibujo.js),
// el audio, la vibración y el acompañamiento musical.
//  - Entrada táctil: tocar el carril (multitáctil).
//  - Entrada de teclado (para probar en el computador): D F J K.
// =====================================================================
import { cancionPorId } from '../canciones/index.js';
import { crearPartida, CUENTA_ATRAS_MS } from '../motor/partida.js';
import { Lienzo, TECLAS } from '../motor/dibujo.js';
import { Acompanamiento } from '../motor/acompanamiento.js';
import { obtenerAjustes, registrarPartida, sumarNotasAcertadas } from '../almacenamiento.js';
import { siguienteDe } from '../progreso.js';
import {
  iniciarAudio, tocarNota, tocarNotaMala, sonidoAcierto, sonidoAciertoB, sonidoCombo, sonidoCuentaAtras,
  sonidoPausa, sonidoVictoria, sonidoDerrota, sonidoClic,
} from '../audio.js';
import { vibrar } from '../vibracion.js';

const MODO_PRUEBA = new URLSearchParams(location.search).has('test'); // ?test=1 -> reloj manual

export default {
  montar(el, { cancionId, nivelId }, nav) {
    const cancion = cancionPorId(cancionId);
    iniciarAudio();

    el.innerHTML = `
      <canvas class="juego-lienzo" id="lienzo"></canvas>
      <div class="hud">
        <button class="boton suave boton-icono" id="btn-pausa" aria-label="Pausa">⏸</button>
        <div class="hud-centro"><div class="puntaje" id="puntaje">0</div><small></small></div>
        <div class="multiplicador" id="mult">x1</div>
      </div>
      <div class="vida" id="vida"><i id="barra-vida"></i></div>
      <div class="combo" id="combo"></div>
      <div class="cuenta" id="cuenta"></div>
      <div class="capa-pausa" id="capa-pausa" hidden>
        <h2 class="titulo">Pausa</h2>
        <button class="boton" id="btn-seguir">▶ Continuar</button>
        <button class="boton cian" id="btn-reiniciar">↻ Reiniciar</button>
        <button class="boton suave" id="btn-salir">Salir</button>
      </div>`;
    const $ = (s) => el.querySelector(s);

    const ajustes = obtenerAjustes();
    const lienzo = new Lienzo($('#lienzo'), { arcoiris: ajustes.arcoiris });
    let fondo = null;
    let terminado = false;
    let ultimoCuenta = null;
    let temporizadorFin = null;
    let contadorAcierto = 0; // alterna entre sonidoAcierto() y sonidoAciertoB()

    // Estado de la partida con los "oyentes" que reaccionan a cada evento
    const partida = crearPartida(cancion, nivelId, {
      alJuicio({ tipo, carril, nota }) {
        lienzo.efectoJuicio(tipo, carril, partida.tiempo);
        if (tipo === 'fallo') { tocarNotaMala(); vibrar('fallo'); }
        else {
          tocarNota(nota.freq, cancion.instrumento, null, 0.6);
          contadorAcierto += 1;
          (contadorAcierto % 2 === 0 ? sonidoAciertoB : sonidoAcierto)(tipo === 'perfecto');
          vibrar(tipo);
        }
        actualizarHud();
      },
      alCombo(mult) {
        sonidoCombo(mult); vibrar('combo'); lienzo.efectoCombo();
        const m = $('#mult'); m.classList.remove('sube'); void m.offsetWidth; m.classList.add('sube');
        const aviso = document.createElement('div');
        aviso.className = 'aviso-multi'; aviso.textContent = `¡COMBO x${mult}!`;
        el.appendChild(aviso); setTimeout(() => aviso.remove(), 1000);
      },
      alFin(resultado) { cerrarPartida(resultado); },
    });
    fondo = new Acompanamiento(partida.fondo);
    $('.hud-centro small').textContent = `${cancion.titulo} · ${partida.nivel.nombre}`;

    // ---------- HUD (puntaje, combo, vida) ----------
    function actualizarHud() {
      $('#puntaje').textContent = Math.round(partida.puntaje).toLocaleString('es-CO');
      $('#mult').textContent = `x${partida.multiplicador}`;
      const barra = $('#barra-vida');
      barra.style.width = `${partida.vida}%`;
      $('#vida').classList.toggle('baja', partida.vida < 30);
      const combo = $('#combo');
      if (partida.combo >= 3) {
        combo.innerHTML = `${partida.combo}<small>COMBO</small>`;
        combo.classList.add('activo');
        combo.classList.remove('golpe'); void combo.offsetWidth; combo.classList.add('golpe');
      } else combo.classList.remove('activo');
    }

    // ---------- Cuenta atrás ----------
    function actualizarCuenta() {
      const c = $('#cuenta');
      if (partida.tiempo < 0) {
        const n = Math.ceil(-partida.tiempo / 1000);
        if (n !== ultimoCuenta) { ultimoCuenta = n; c.className = 'cuenta'; c.innerHTML = `<span>${n}</span>`; sonidoCuentaAtras(false); }
      } else if (ultimoCuenta !== 0) {
        ultimoCuenta = 0; c.className = 'cuenta ya'; c.innerHTML = '<span>¡YA!</span>'; sonidoCuentaAtras(true);
      } else if (partida.tiempo > 900 && c.innerHTML) c.innerHTML = ''; // se quita el "¡YA!" según el reloj del juego
    }

    // ---------- Entrada ----------
    function tocarCarril(carril) {
      if (partida.estado !== 'jugando') return;
      lienzo.efectoToque(carril);
      lienzo.presionado[carril] = true;
      partida.pulsar(carril);
    }
    const soltarCarril = (carril) => { lienzo.presionado[carril] = false; };
    const carrilDePuntero = (e) => {
      const caja = $('#lienzo').getBoundingClientRect();
      return Math.max(0, Math.min(3, Math.floor(((e.clientX - caja.left) / caja.width) * 4)));
    };
    const canvas = $('#lienzo');
    canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); tocarCarril(carrilDePuntero(e)); });
    const alSoltar = (e) => soltarCarril(carrilDePuntero(e));
    canvas.addEventListener('pointerup', alSoltar);
    canvas.addEventListener('pointercancel', alSoltar);

    const alTecla = (e) => {
      if (e.repeat) return;
      const k = e.key.toUpperCase();
      if (k === 'ESCAPE' || k === 'P') { alternarPausa(); return; }
      const c = TECLAS.indexOf(k);
      if (c >= 0) tocarCarril(c);
    };
    const alTeclaArriba = (e) => { const c = TECLAS.indexOf(e.key.toUpperCase()); if (c >= 0) soltarCarril(c); };
    window.addEventListener('keydown', alTecla);
    window.addEventListener('keyup', alTeclaArriba);

    // ---------- Pausa ----------
    function pausar() {
      if (partida.estado !== 'jugando') return;
      partida.pausar(); sonidoPausa(); vibrar('clic');
      $('#capa-pausa').hidden = false;
    }
    function reanudar() {
      if (partida.estado !== 'pausa') return;
      $('#capa-pausa').hidden = true;
      partida.reanudar();
      anterior = performance.now();
    }
    function alternarPausa() { partida.estado === 'pausa' ? reanudar() : pausar(); }
    $('#btn-pausa').onclick = pausar;
    $('#btn-seguir').onclick = () => { sonidoClic(); reanudar(); };
    $('#btn-reiniciar').onclick = () => { sonidoClic(); nav.irA('juego', { cancionId, nivelId }, { reemplazar: true }); };
    $('#btn-salir').onclick = () => { sonidoClic(); partida.abandonar(); terminado = true; nav.volver() || nav.irA('home', {}, { reemplazar: true }); };
    const alAtrasAndroid = () => alternarPausa();
    window.addEventListener('nf:atras', alAtrasAndroid);
    const alVisibilidad = () => { if (document.hidden) pausar(); };
    document.addEventListener('visibilitychange', alVisibilidad);

    // ---------- Fin de la partida ----------
    function cerrarPartida(resultado) {
      if (terminado) return;
      terminado = true;
      const antes = siguienteDe(cancionId, nivelId);
      const { esRecord } = registrarPartida({ cancionId, nivelId, ...resultado, ganada: resultado.ganada });
      sumarNotasAcertadas(resultado.perfectos + resultado.bien);
      const despues = siguienteDe(cancionId, nivelId);
      const nuevoDesbloqueo = !antes && despues ? despues : null;
      if (resultado.ganada) { sonidoVictoria(); vibrar('victoria'); } else { sonidoDerrota(); vibrar('derrota'); }
      temporizadorFin = setTimeout(() => {
        nav.irA('resultados', { cancionId, nivelId, resultado, esRecord, nuevoDesbloqueo }, { reemplazar: true });
      }, resultado.ganada ? 500 : 900);
    }

    // ---------- Bucle principal ----------
    let anterior = performance.now();
    let rafId = 0;
    function paso(dt, dibujar = true) {
      if (partida.estado === 'jugando') {
        partida.avanzar(dt);
        fondo.actualizar(partida.tiempo);
        actualizarCuenta();
      }
      lienzo.actualizar(dt, partida);
      if (dibujar) lienzo.dibujar(partida);
    }
    function cuadro(ahora) {
      const dt = Math.min(50, ahora - anterior);
      anterior = ahora;
      paso(dt);
      rafId = requestAnimationFrame(cuadro);
    }
    if (!MODO_PRUEBA) rafId = requestAnimationFrame(cuadro);
    else lienzo.dibujar(partida);
    actualizarHud();
    actualizarCuenta();

    const alRedimensionar = () => lienzo.redimensionar();
    window.addEventListener('resize', alRedimensionar);

    // Ganchos para las pruebas automáticas (pruebas/e2e.py): avanzar el reloj a mano
    window.__nf = {
      partida, lienzo,
      // Avanza el reloj `ms` milisegundos y dibuja un solo cuadro al final (más rápido para pruebas)
      avanzar(ms, dibujar = true) { let r = ms; while (r > 0) { const d = Math.min(16, r); paso(d, false); r -= d; } if (dibujar) lienzo.dibujar(partida); },
      pulsar: tocarCarril,
    };

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(temporizadorFin);
      window.removeEventListener('keydown', alTecla);
      window.removeEventListener('keyup', alTeclaArriba);
      window.removeEventListener('resize', alRedimensionar);
      window.removeEventListener('nf:atras', alAtrasAndroid);
      document.removeEventListener('visibilitychange', alVisibilidad);
      if (partida.estado !== 'fin') partida.abandonar();
      if (window.__nf?.partida === partida) delete window.__nf;
    };
  },
};
