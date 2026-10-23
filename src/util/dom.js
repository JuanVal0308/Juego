// =====================================================================
// dom.js - pequeñas ayudas para trabajar con el DOM
// =====================================================================

/** Escapa texto del usuario antes de meterlo en un innerHTML (evita inyección de HTML). */
export function esc(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Muestra un mensaje emergente breve en la parte superior. */
export function aviso(texto, ms = 2600) {
  const cont = document.getElementById('avisos');
  const el = document.createElement('div');
  el.className = 'aviso';
  el.textContent = texto;
  cont.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

/** Formatea un número con separador de miles: 12345 -> "12.345". */
export const miles = (n) => Math.round(n).toLocaleString('es-CO');

/** Dibuja estrellas llenas/vacías como texto (★★☆). */
export const estrellasTexto = (n, max = 3) => '★'.repeat(n) + '☆'.repeat(max - n);
