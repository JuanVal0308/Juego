#!/usr/bin/env python3
# =====================================================================
# herramientas/grafico_funcion.py - Genera el gráfico de funciones de Google Play (1024x500)
# Dibuja un SVG en una página de Chrome (Playwright) con el mismo estilo neón de la app:
# fondo morado oscuro, carriles con notas que caen, logo de NotaFlow y título con degradado.
# Uso:  python3 herramientas/grafico_funcion.py
# =====================================================================
import os, random
from pathlib import Path
from playwright.sync_api import sync_playwright

SALIDA = Path(__file__).resolve().parent.parent / 'docs' / 'tienda' / 'grafico-funciones-1024x500.png'
CHROME = os.environ.get('CHROME_PATH', '/usr/bin/google-chrome')
random.seed(7)

colores = ['#22e5ff', '#ff2bd6', '#ffd84a', '#4dff9a']
# Notas que caen por 4 carriles a la derecha del título (x entre 600 y 1000)
notas = []
for c in range(4):
    x = 612 + c * 100
    y = random.randint(-40, 40)
    while y < 480:
        largo = random.choice([34, 34, 34, 80])
        notas.append(f'<rect x="{x}" y="{y}" width="76" height="{largo}" rx="12" fill="{colores[c]}" opacity="{random.uniform(.6,1):.2f}" filter="url(#glow)"/>')
        y += largo + random.randint(50, 130)
carriles = ''.join(f'<rect x="{608 + c*100}" y="0" width="84" height="500" fill="#ffffff" opacity=".04"/>' for c in range(4))
aros = ''.join(f'<circle cx="{650 + c*100}" cy="420" r="34" fill="none" stroke="{colores[c]}" stroke-width="5" filter="url(#glow)"/>' for c in range(4))
estrellas = ''.join(f'<circle cx="{random.randint(0,1024)}" cy="{random.randint(0,500)}" r="{random.choice([1,1.5,2])}" fill="#fff" opacity="{random.uniform(.2,.7):.2f}"/>' for _ in range(60))

html = f"""<html><body style="margin:0;background:#12062b">
<svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
 <defs>
  <linearGradient id="fondo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b0b3a"/><stop offset="1" stop-color="#0c0420"/></linearGradient>
  <radialGradient id="aura1" cx=".2" cy=".5" r=".6"><stop offset="0" stop-color="#8a5cff" stop-opacity=".55"/><stop offset="1" stop-color="#8a5cff" stop-opacity="0"/></radialGradient>
  <radialGradient id="aura2" cx=".85" cy=".9" r=".5"><stop offset="0" stop-color="#ff2bd6" stop-opacity=".35"/><stop offset="1" stop-color="#ff2bd6" stop-opacity="0"/></radialGradient>
  <linearGradient id="nota" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22e5ff"/><stop offset="1" stop-color="#ff2bd6"/></linearGradient>
  <linearGradient id="titulo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#22e5ff"/><stop offset="1" stop-color="#ff2bd6"/></linearGradient>
  <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="glow2" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 </defs>
 <rect width="1024" height="500" fill="url(#fondo)"/>
 <rect width="1024" height="500" fill="url(#aura1)"/><rect width="1024" height="500" fill="url(#aura2)"/>
 {estrellas}
 {carriles}
 <rect x="590" y="420" width="420" height="3" fill="#fff" opacity=".35"/>
 {''.join(notas)}
 {aros}
 <g transform="translate(48,64) scale(1.15)">
  <circle cx="64" cy="64" r="58" fill="none" stroke="url(#nota)" stroke-width="3" opacity=".6"/>
  <path filter="url(#glow)" d="M52 30v52a14 12 0 1 1-8-11V38l44-10v40a14 12 0 1 1-8-11V36z" fill="url(#nota)"/>
 </g>
 <text x="210" y="168" font-family="Poppins" font-weight="800" font-size="78" fill="url(#titulo)" filter="url(#glow2)">NotaFlow</text>
 <text x="64" y="268" font-family="Poppins" font-weight="600" font-size="34" fill="#f4eeff">Siente el ritmo, sigue la nota</text>
 <g font-family="Poppins" font-weight="600" font-size="22" fill="#b9a9e6">
  <text x="64" y="330">♪ 7 canciones · 3 niveles cada una</text>
  <text x="64" y="366">♪ Toca los 4 carriles al compás</text>
  <text x="64" y="402">♪ Secretos por descubrir</text>
 </g>
</svg></body></html>"""

with sync_playwright() as pw:
    nav = pw.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
    pg = nav.new_page(viewport={'width': 1024, 'height': 500}, device_scale_factor=1)
    pg.set_content(html); pg.wait_for_timeout(500)
    pg.screenshot(path=str(SALIDA))
    nav.close()
print('listo', SALIDA)
