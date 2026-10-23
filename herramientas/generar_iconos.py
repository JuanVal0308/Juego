"""Genera los iconos de NotaFlow (Play Store 512, primer plano adaptativo y mipmaps)
a partir de un SVG dibujado en código. Se renderiza con Chrome headless (Playwright).
Uso: python3 herramientas/generar_iconos.py   (después de `npx cap add android`)"""
import pathlib
from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
RES = RAIZ / 'android/app/src/main/res'
FONDO = '#1b0b3a'  # morado oscuro SÓLIDO (nunca blanco) para el icono adaptativo

# Nota musical doble con degradado cian -> magenta, centrada en un lienzo de 108 unidades
NOTA = '''<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#22e5ff"/><stop offset="1" stop-color="#ff2bd6"/></linearGradient>
<filter id="b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>
<g transform="translate(54 54) scale({s}) translate(-64 -64)">
<path d="M52 30v52a14 12 0 1 1-8-11V38l44-10v40a14 12 0 1 1-8-11V36z" fill="url(#g)" filter="url(#b)" opacity=".55"/>
<path d="M52 30v52a14 12 0 1 1-8-11V38l44-10v40a14 12 0 1 1-8-11V36z" fill="url(#g)"/></g>'''

def svg(tam, fondo, escala, redondo=0, circulo=False):
    f = ''
    if fondo:
        if circulo:
            f = f'<circle cx="54" cy="54" r="54" fill="{FONDO}"/>'
        else:
            f = f'<rect width="108" height="108" rx="{redondo}" fill="{FONDO}"/>'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{tam}" height="{tam}" viewBox="0 0 108 108">'
            f'{f}{NOTA.format(s=escala)}</svg>')

def render(pagina, contenido, ruta, transparente):
    pagina.set_content(f'<body style="margin:0;background:transparent">{contenido}</body>')
    ruta.parent.mkdir(parents=True, exist_ok=True)
    pagina.locator('svg').screenshot(path=str(ruta), omit_background=transparente)

DENSIDADES = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}

with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg = nav.new_page(viewport={'width': 600, 'height': 600})
    # Icono de la tienda (512x512, sin transparencia)
    render(pg, svg(512, True, 0.62), RAIZ / 'docs/tienda/icono-512.png', False)
    for d, k in DENSIDADES.items():
        t = int(108 * k)
        # Primer plano adaptativo: RGBA con fondo transparente; la nota queda dentro de la zona segura (66dp)
        render(pg, svg(t, False, 0.50), RES / f'mipmap-{d}/ic_launcher_foreground.png', True)
        # Iconos clásicos (Android < 8)
        l = int(48 * k)
        render(pg, svg(l, True, 0.62, redondo=18), RES / f'mipmap-{d}/ic_launcher.png', True)
        render(pg, svg(l, True, 0.62, circulo=True), RES / f'mipmap-{d}/ic_launcher_round.png', True)
    nav.close()

# Color de fondo del icono adaptativo (sólido, no blanco)
(RES / 'values/ic_launcher_background.xml').write_text(
    f'<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">{FONDO}</color>\n</resources>\n')
print('Iconos generados')
