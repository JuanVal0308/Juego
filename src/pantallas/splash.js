// =====================================================================
// splash.js - Pantalla 1: Splash con logo animado
// El audio del navegador solo se puede activar tras un toque del
// usuario, por eso la pantalla pide "Toca para comenzar".
// =====================================================================
import { logoSVG, tituloLetras, ecualizador } from '../util/logo.js';
import { iniciarAudio, sonidoLogo } from '../audio.js';
import { vibrar } from '../vibracion.js';

export default {
  montar(el, _params, nav) {
    el.innerHTML = `
      <div class="splash-logo">${logoSVG(150)}</div>
      <h1 class="letras" aria-label="NotaFlow">${tituloLetras()}</h1>
      <p class="lema">Siente el ritmo</p>
      ${ecualizador(11)}
      <p class="toca-para-empezar">Toca para comenzar</p>
      <p class="pie-splash">UPB · Aplicaciones móviles · Hecho en UPB</p>`;

    let ya = false;
    const entrar = () => {
      if (ya) return;
      ya = true;
      iniciarAudio();   // desbloquea el audio con este primer toque
      sonidoLogo();
      vibrar('victoria');
      setTimeout(() => nav.irA('home', {}, { reemplazar: true }), 420);
    };
    el.addEventListener('pointerdown', entrar);
    const teclado = (e) => { if (e.key === 'Enter' || e.key === ' ') entrar(); };
    window.addEventListener('keydown', teclado);
    return () => window.removeEventListener('keydown', teclado);
  },
};
