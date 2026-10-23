// =====================================================================
// acompanamiento.js
// Programa el bajo y la batería de la canción con un poco de ANTICIPACIÓN
// (técnica "lookahead"): en cada cuadro se agendan en la Web Audio los
// eventos de los próximos ~150 ms usando el reloj de audio, que es muy
// preciso. Así el ritmo no se descuadra aunque la pantalla se trabe.
// =====================================================================
import { bombo, caja, hihat, bajo, tiempoAudio, audioDisponible } from '../audio.js';

const ANTICIPACION_MS = 150;

export class Acompanamiento {
  constructor(eventos) {
    this.eventos = eventos; // [{ t, tipo, freq?, dur? }] ordenados por t (ms de canción)
    this.indice = 0;
  }

  /** Agenda los eventos que caen entre ahora y ahora + ANTICIPACIÓN. */
  actualizar(tiempoCancionMs) {
    if (!audioDisponible()) return;
    const limite = tiempoCancionMs + ANTICIPACION_MS;
    while (this.indice < this.eventos.length && this.eventos[this.indice].t <= limite) {
      const e = this.eventos[this.indice++];
      if (e.t < tiempoCancionMs - 60) continue; // evento ya vencido: se omite
      const cuando = tiempoAudio() + Math.max(0, (e.t - tiempoCancionMs) / 1000);
      switch (e.tipo) {
        case 'bombo': bombo(cuando); break;
        case 'caja': caja(cuando); break;
        case 'hihat': hihat(cuando, false); break;
        case 'hihatAbierto': hihat(cuando, true); break;
        case 'bajo': bajo(e.freq, cuando, e.dur); break;
      }
    }
  }
}
