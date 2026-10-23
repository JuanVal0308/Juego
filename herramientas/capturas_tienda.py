#!/usr/bin/env python3
# =====================================================================
# herramientas/capturas_tienda.py - Genera las 8 capturas para Google Play
# Usa Playwright con una pantalla de 360x640 y escala x3 = 1080x1920 (9:16 exacto).
# Reutiliza el reloj manual del juego (?test=1), igual que pruebas/e2e.py.
# Uso (con `npm run dev` encendido):  python3 herramientas/capturas_tienda.py [URL_BASE]
# =====================================================================
import os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:5173/').rstrip('/') + '/'
SALIDA = Path(__file__).resolve().parent.parent / 'docs' / 'tienda' / 'capturas-1080x1920'
SALIDA.mkdir(parents=True, exist_ok=True)
CHROME = os.environ.get('CHROME_PATH', '/usr/bin/google-chrome')

# Juega con toques perfectos hasta cierto tiempo (o hasta el final si no se indica)
JUGAR = """
(hasta) => {
  const nf = window.__nf, p = nf.partida; let g = 0;
  while (p.estado === 'jugando' && (hasta == null || p.tiempo < hasta) && g++ < 200000) {
    nf.avanzar(4, false);
    for (const n of p.notas) if (n.estado === 0 && Math.abs(n.t - p.tiempo) <= 2) nf.pulsar(n.carril);
  }
  nf.avanzar(0);
  return p.resultado;
}
"""

def foto(pg, nombre):
    pg.evaluate("document.querySelectorAll('.aviso').forEach((e) => e.remove())")
    pg.screenshot(path=str(SALIDA / f'{nombre}.png'))
    print('captura', nombre)

with sync_playwright() as pw:
    nav = pw.chromium.launch(executable_path=CHROME, args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])
    ctx = nav.new_context(viewport={'width': 360, 'height': 640}, device_scale_factor=3, has_touch=True, locale='es-CO')
    pg = ctx.new_page()
    pg.goto(BASE + '?test=1'); pg.evaluate('localStorage.clear()'); pg.reload(); pg.wait_for_timeout(3200)
    foto(pg, '01-splash')
    pg.locator('.pantalla-splash').click(); pg.wait_for_selector('.pantalla-home'); pg.wait_for_timeout(600)
    pg.fill('#entrada-nombre', 'Juan Pablo'); pg.click('#btn-guardar-nombre'); pg.wait_for_timeout(500)
    # Una partida de Estrellita (Fácil): captura a mitad de canción y luego los resultados
    pg.click('#btn-jugar'); pg.wait_for_selector('.pantalla-canciones'); pg.wait_for_timeout(800)
    pg.click('.cancion[data-id="estrellita"]'); pg.wait_for_selector('.pantalla-niveles'); pg.wait_for_timeout(800)
    pg.click('.nivel[data-nivel="facil"]'); pg.wait_for_selector('.pantalla-juego'); pg.wait_for_timeout(500)
    pg.evaluate(JUGAR, 16000); pg.wait_for_timeout(100)
    foto(pg, '05-juego-en-curso')
    pg.evaluate(JUGAR, None)
    pg.wait_for_selector('.pantalla-resultados'); pg.wait_for_timeout(2800)
    foto(pg, '06-resultados')
    pg.wait_for_timeout(3500)
    # Con progreso guardado: niveles, canciones, inicio, puntajes y créditos
    pg.click('#btn-niveles'); pg.wait_for_selector('.pantalla-niveles'); pg.wait_for_timeout(900)
    foto(pg, '04-niveles')
    # Se vuelve al inicio con el botón atrás (las veces que haga falta) y se entra a la lista de canciones
    for _ in range(4):
        if pg.locator('.pantalla-home').count(): break
        pg.click('#atras'); pg.wait_for_timeout(700)
    pg.wait_for_selector('.pantalla-home')
    pg.click('#btn-jugar'); pg.wait_for_selector('.pantalla-canciones'); pg.wait_for_timeout(900)
    foto(pg, '03-canciones')
    pg.click('#atras'); pg.wait_for_selector('.pantalla-home'); pg.wait_for_timeout(700)
    foto(pg, '02-inicio')
    pg.click('#btn-puntajes'); pg.wait_for_selector('.pantalla-puntajes'); pg.wait_for_timeout(700)
    foto(pg, '07-puntajes')
    pg.click('#atras'); pg.wait_for_selector('.pantalla-home'); pg.wait_for_timeout(500)
    pg.click('#btn-creditos'); pg.wait_for_selector('.pantalla-creditos'); pg.wait_for_timeout(900)
    foto(pg, '08-creditos')
    nav.close()
