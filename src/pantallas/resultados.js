// =====================================================================
// resultados.js - Pantalla: Resultados de la partida
// Muestra estrellas animadas, puntaje que sube contando, estadísticas,
// aviso de récord y de desbloqueos (progresión).
// =====================================================================
import { cancionPorId } from '../canciones/index.js';
import { nivelPorId } from '../niveles.js';
import { sonidoEstrella, sonidoClic, sonidoAtras } from '../audio.js';
import { vibrar } from '../vibracion.js';
import { lanzarConfeti } from '../util/confeti.js';
import { aviso, esc, miles } from '../util/dom.js';

// TODO(equipo): Integrante 2 agrega aquí el easter egg #5 en resultados (ver TAREAS_EQUIPO.md),
// por ejemplo un mensaje especial si el puntaje termina en 777.
export default {
  montar(el, { cancionId, nivelId, resultado: r, esRecord, nuevoDesbloqueo }, nav) {
    const c = cancionPorId(cancionId);
    const n = nivelPorId(nivelId);
    const fullCombo = r.ganada && r.sinFallos; // easter egg #3: partida sin ningún fallo
    const pct = Math.round(r.precision * 100);

    el.innerHTML = `
      <h2 class="titulo res-titulo ${r.ganada ? '' : 'perdiste'}">${r.ganada ? '¡Canción completada!' : 'Te quedaste sin vida'}</h2>
      <p class="res-cancion">${esc(c.titulo)} · ${n.nombre}</p>
      <div class="res-estrellas" aria-label="${r.estrellas} de 3 estrellas">
        ${[0, 1, 2].map((i) => `<span class="e ${i < r.estrellas ? 'llena' : 'vacia'}" style="--i:${i}">★</span>`).join('')}
      </div>
      ${fullCombo ? '<div class="insignia-full">🔥 ¡FULL COMBO! 🔥</div>' : ''}
      <div class="res-puntaje" id="puntaje">0</div>
      ${esRecord && r.ganada ? '<div class="res-record">¡NUEVO RÉCORD!</div>' : ''}
      <div class="res-stats">
        <div class="dato"><b>${pct} %</b><small>Precisión</small></div>
        <div class="dato"><b>${r.combo}</b><small>Mejor combo</small></div>
        <div class="dato perfecto"><b>${r.perfectos}</b><small>Perfectos</small></div>
        <div class="dato bien"><b>${r.bien}</b><small>Bien</small></div>
        <div class="dato fallo"><b>${r.fallos}</b><small>Fallos</small></div>
        <div class="dato"><b>${r.totalNotas}</b><small>Notas</small></div>
      </div>
      <div class="res-botones">
        ${nuevoDesbloqueo ? `<p class="subtitulo" style="color:var(--verde)">🔓 ¡Desbloqueaste: ${nuevoDesbloqueo.cancionId === cancionId ? nivelPorId(nuevoDesbloqueo.nivelId).nombre : esc(cancionPorId(nuevoDesbloqueo.cancionId).titulo)}!</p>` : ''}
        ${!r.ganada ? '<p class="subtitulo">Consejo: prueba un nivel más fácil o toca justo cuando la nota llegue a la línea.</p>' : r.estrellas === 0 ? '<p class="subtitulo">Necesitas ★ 1 estrella (50 % de precisión) para desbloquear lo siguiente.</p>' : ''}
        ${nuevoDesbloqueo ? '<button class="boton" id="btn-siguiente">Siguiente ▶</button>' : ''}
        <div class="fila">
          <button class="boton cian" id="btn-reintentar">↻ Reintentar</button>
          <button class="boton suave" id="btn-niveles">Niveles</button>
        </div>
        <button class="boton suave" id="btn-menu">Menú principal</button>
      </div>`;
    const $ = (s) => el.querySelector(s);

    // Puntaje que sube contando (animación)
    const marcador = $('#puntaje');
    const inicio = performance.now();
    const duracion = 1100;
    let raf = requestAnimationFrame(function contar(ahora) {
      const p = Math.min(1, (ahora - inicio) / duracion);
      marcador.textContent = miles(r.puntaje * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(contar);
    });

    // Estrellas con sonido ascendente, una tras otra
    const timers = [];
    for (let i = 0; i < r.estrellas; i++) {
      timers.push(setTimeout(() => { sonidoEstrella(i); vibrar('perfecto'); }, i * 450 + 300));
    }
    if (r.estrellas >= 2 || fullCombo) timers.push(setTimeout(() => lanzarConfeti(fullCombo ? 140 : 80), 600));
    if (nuevoDesbloqueo) timers.push(setTimeout(() => aviso('🔓 ¡Nuevo contenido desbloqueado!'), 1400));

    // Botones
    $('#btn-reintentar').onclick = () => { sonidoClic(); nav.irA('juego', { cancionId, nivelId }, { reemplazar: true }); };
    $('#btn-niveles').onclick = () => { sonidoAtras(); nav.irA('niveles', { cancionId }, { reemplazar: true }); };
    $('#btn-menu').onclick = () => { sonidoAtras(); nav.irA('home', {}, { reemplazar: true }); };
    const sig = $('#btn-siguiente');
    if (sig) sig.onclick = () => { sonidoClic(); nav.irA('juego', { cancionId: nuevoDesbloqueo.cancionId, nivelId: nuevoDesbloqueo.nivelId }, { reemplazar: true }); };

    return () => { cancelAnimationFrame(raf); timers.forEach(clearTimeout); };
  },
};
