// =====================================================================
// logo.js - Logo de NotaFlow como SVG en línea (nota musical neón)
// =====================================================================
export function logoSVG(tam = 120) {
  return `
  <svg class="logo-svg" width="${tam}" height="${tam}" viewBox="0 0 128 128" role="img" aria-label="Logo de NotaFlow">
    <defs>
      <linearGradient id="lg-nota" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#22e5ff"/><stop offset="1" stop-color="#ff2bd6"/>
      </linearGradient>
      <filter id="lg-brillo" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <circle cx="64" cy="64" r="58" fill="none" stroke="url(#lg-nota)" stroke-width="3" opacity=".55" class="logo-aro"/>
    <path filter="url(#lg-brillo)" d="M52 30v52a14 12 0 1 1-8-11V38l44-10v40a14 12 0 1 1-8-11V36z" fill="url(#lg-nota)"/>
  </svg>`;
}

/** Texto "NotaFlow" con cada letra en su propio <span> para animarlas una a una. */
export function tituloLetras(texto = 'NotaFlow') {
  return [...texto].map((l, i) => `<span style="--i:${i}">${l}</span>`).join('');
}

/** Barras tipo ecualizador (decorativas, se animan con CSS). */
export function ecualizador(n = 9) {
  return `<div class="ecualizador" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>`;
}
