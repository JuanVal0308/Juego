#!/usr/bin/env python3
# =====================================================================
# pruebas/e2e.py - Pruebas de extremo a extremo de NotaFlow
# Usa Playwright + Chrome en modo headless (pantalla de 360x800, como un celular).
#
#  Qué recorre:
#   - Todas las pantallas (Splash, Home, Ajustes, Cómo jugar, Canciones, Niveles,
#     Juego, Pausa, Resultados, Puntajes, Créditos) y toma capturas en docs/capturas/.
#   - Una canción completa con toques perfectos (gana con 3 estrellas).
#   - Una partida donde el jugador no toca nada (pierde por quedarse sin vida).
#   - Persistencia: recarga la página y comprueba que localStorage conserva todo.
#   - Desbloqueo de niveles/canciones, easter eggs y entrada por teclado.
#
#  Cómo ejecutarla (con el servidor de desarrollo encendido: npm run dev):
#      python3 pruebas/e2e.py [URL_BASE]
#  La URL por defecto es http://localhost:5173/
# =====================================================================
import json, os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:5173/').rstrip('/') + '/'
RAIZ = Path(__file__).resolve().parent.parent
CAPTURAS = RAIZ / 'docs' / 'capturas'
CAPTURAS.mkdir(parents=True, exist_ok=True)
CHROME = os.environ.get('CHROME_PATH', '/usr/bin/google-chrome')

resultados = []   # (nombre, ok, detalle)
errores_consola = []

def comprobar(nombre, condicion, detalle=''):
    resultados.append((nombre, bool(condicion), str(detalle)))
    print(('  OK   ' if condicion else '  FALLA'), nombre, ('— ' + str(detalle)) if detalle != '' else '')

def captura(pg, nombre, limpiar_avisos=True):
    # Los avisos (toasts) duran unos segundos: se quitan para que no tapen la pantalla en la captura
    if limpiar_avisos:
        pg.evaluate("document.querySelectorAll('.aviso').forEach((e) => e.remove())")
    pg.screenshot(path=str(CAPTURAS / f'{nombre}.png'))

def storage(pg):
    return pg.evaluate("JSON.parse(localStorage.getItem('notaflow:v1') || 'null')")

# JavaScript que juega una partida COMPLETA con toques perfectos avanzando el reloj manual
JUGAR_PERFECTO = """
() => {
  const nf = window.__nf, p = nf.partida;
  let guardia = 0;
  while (p.estado === 'jugando' && guardia++ < 200000) {
    nf.avanzar(4, false);
    for (const n of p.notas) if (n.estado === 0 && Math.abs(n.t - p.tiempo) <= 2) nf.pulsar(n.carril);
  }
  return p.resultado;
}
"""
# Avanza el reloj sin tocar nada hasta que la partida termina
JUGAR_SIN_TOCAR = """
() => { const nf = window.__nf, p = nf.partida; let g = 0; while (p.estado === 'jugando' && g++ < 200000) nf.avanzar(16, false); return p.resultado; }
"""
# Toca mientras avanza hasta un tiempo dado (para capturas a mitad de canción)
JUGAR_HASTA = """
(hasta) => {
  const nf = window.__nf, p = nf.partida;
  while (p.estado === 'jugando' && p.tiempo < hasta) {
    nf.avanzar(4, false);
    for (const n of p.notas) if (n.estado === 0 && Math.abs(n.t - p.tiempo) <= 2) nf.pulsar(n.carril);
  }
  nf.avanzar(0);   // dibuja un cuadro para la captura
  return p.tiempo;
}
"""

def main():
    with sync_playwright() as pw:
        navegador = pw.chromium.launch(executable_path=CHROME, args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])
        ctx = navegador.new_context(viewport={'width': 360, 'height': 800}, device_scale_factor=2, has_touch=True, locale='es-CO')
        pg = ctx.new_page()
        pg.on('console', lambda m: errores_consola.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errores_consola.append(str(e)))

        # ---------- 1. Splash ----------
        print('\n[1] Splash')
        pg.goto(BASE + '?test=1')
        pg.evaluate("localStorage.clear()")
        pg.reload()
        pg.wait_for_timeout(3200)
        comprobar('Splash visible', pg.locator('.pantalla-splash').count() == 1)
        captura(pg, '01-splash')
        pg.locator('.pantalla-splash').click()
        pg.wait_for_selector('.pantalla-home')
        pg.wait_for_timeout(700)

        # ---------- 2. Home + nombre ----------
        print('\n[2] Home y nombre del jugador')
        comprobar('Home visible', pg.locator('.pantalla-home').count() == 1)
        comprobar('Se pide el nombre la primera vez', pg.locator('#entrada-nombre').count() == 1)
        captura(pg, '02-home-nombre')
        pg.fill('#entrada-nombre', 'Juan Pablo')
        pg.click('#btn-guardar-nombre')
        pg.wait_for_timeout(500)
        comprobar('Nombre guardado en localStorage', storage(pg)['nombre'] == 'Juan Pablo', storage(pg)['nombre'])
        captura(pg, '03-home')

        # ---------- 3. Ajustes y Cómo jugar ----------
        print('\n[3] Ajustes y ayuda')
        pg.click('#btn-ajustes'); pg.wait_for_selector('.pantalla-ajustes'); pg.wait_for_timeout(600)
        captura(pg, '04-ajustes')
        pg.click('#sw-vibracion')
        comprobar('Ajuste de vibración se guarda', storage(pg)['ajustes']['vibracion'] is False)
        pg.click('#sw-vibracion')
        pg.fill('#rango-volumen', '55')
        pg.evaluate("document.querySelector('#rango-volumen').dispatchEvent(new Event('input', {bubbles:true}))")
        comprobar('Volumen se guarda', abs(storage(pg)['ajustes']['volumen'] - 0.55) < 0.01, storage(pg)['ajustes']['volumen'])
        pg.click('#atras'); pg.wait_for_selector('.pantalla-home'); pg.wait_for_timeout(500)
        pg.click('#btn-ayuda'); pg.wait_for_selector('.pantalla-ayuda'); pg.wait_for_timeout(600)
        captura(pg, '05-como-jugar')
        pg.click('#atras'); pg.wait_for_selector('.pantalla-home'); pg.wait_for_timeout(500)

        # ---------- 4. Canciones y niveles (estado inicial) ----------
        print('\n[4] Selección de canción y nivel')
        pg.click('#btn-jugar'); pg.wait_for_selector('.pantalla-canciones'); pg.wait_for_timeout(900)
        tarjetas = pg.locator('.cancion')
        comprobar('Lista de canciones (6 normales)', tarjetas.count() == 6, tarjetas.count())
        comprobar('Solo la primera canción está abierta', pg.locator('.cancion.bloqueada').count() == 5, pg.locator('.cancion.bloqueada').count())
        captura(pg, '06-canciones')
        pg.click('.cancion[data-id="estrellita"]'); pg.wait_for_selector('.pantalla-niveles'); pg.wait_for_timeout(900)
        comprobar('3 niveles por canción', pg.locator('.nivel').count() == 3)
        comprobar('Medio y Difícil bloqueados al inicio', pg.locator('.nivel.bloqueado').count() == 2)
        captura(pg, '07-niveles')
        pg.click('.nivel[data-nivel="medio"]'); pg.wait_for_timeout(400)
        comprobar('Tocar un nivel bloqueado no entra al juego', pg.locator('.pantalla-juego').count() == 0)

        # ---------- 5. Partida perfecta (Estrellita - Fácil) ----------
        print('\n[5] Partida completa con toques perfectos')
        pg.click('.nivel[data-nivel="facil"]'); pg.wait_for_selector('.pantalla-juego'); pg.wait_for_timeout(500)
        comprobar('Canvas del juego creado', pg.locator('#lienzo').count() == 1)
        comprobar('Cuenta atrás visible', pg.locator('#cuenta span').count() == 1)
        captura(pg, '08-juego-cuenta-atras')
        info = pg.evaluate("() => ({total: window.__nf.partida.totalNotas, vida: window.__nf.partida.vida})")
        comprobar('Notas generadas para el nivel', info['total'] > 30, info['total'])
        pg.evaluate(JUGAR_HASTA, 9000)
        pg.wait_for_timeout(100)
        captura(pg, '09-juego-en-curso')
        pg.evaluate(JUGAR_HASTA, 16000)
        captura(pg, '10-juego-combo')
        # Pausa con la tecla Escape
        pg.keyboard.press('Escape'); pg.wait_for_timeout(350)
        comprobar('Menú de pausa visible', pg.locator('#capa-pausa').is_visible())
        captura(pg, '11-pausa')
        t_pausa = pg.evaluate("window.__nf.partida.tiempo")
        pg.evaluate("window.__nf.avanzar(500)")
        comprobar('El reloj se detiene en pausa', pg.evaluate("window.__nf.partida.tiempo") == t_pausa)
        pg.click('#btn-seguir'); pg.wait_for_timeout(200)
        comprobar('Se reanuda desde la pausa', not pg.locator('#capa-pausa').is_visible())
        res = pg.evaluate(JUGAR_PERFECTO)
        comprobar('Partida ganada', res['ganada'], f"{res['puntaje']} pts")
        comprobar('3 estrellas con toques perfectos', res['estrellas'] == 3, res['estrellas'])
        comprobar('0 fallos y combo = total de notas', res['fallos'] == 0 and res['combo'] == res['totalNotas'], f"combo {res['combo']}")
        pg.wait_for_selector('.pantalla-resultados'); pg.wait_for_timeout(2600)
        captura(pg, '12-resultados-victoria')
        pg.wait_for_timeout(3500)  # espera a que termine el confeti
        s = storage(pg)
        comprobar('Estrellas guardadas', s['progreso']['estrellita']['facil']['estrellas'] == 3)
        comprobar('Puntaje guardado', s['progreso']['estrellita']['facil']['puntaje'] == res['puntaje'])
        comprobar('Ranking local registra la partida', len(s['ranking']) == 1 and s['ranking'][0]['nombre'] == 'Juan Pablo')
        comprobar('Aviso de desbloqueo visible', pg.locator('#btn-siguiente').count() == 1)

        # ---------- 6. Entrada por teclado y juicio Bien/Perfecto ----------
        print('\n[6] Teclado y precisión de los toques')
        pg.click('#btn-niveles'); pg.wait_for_selector('.pantalla-niveles'); pg.wait_for_timeout(900)
        comprobar('Medio se desbloquea con ★ en Fácil', pg.locator('.nivel.bloqueado').count() == 1)
        captura(pg, '13-niveles-desbloqueados')
        pg.click('.nivel[data-nivel="medio"]'); pg.wait_for_selector('.pantalla-juego'); pg.wait_for_timeout(400)
        # Avanza hasta justo antes de la primera nota y la toca con el teclado (Perfecto)
        datos = pg.evaluate("() => { const n = window.__nf.partida.notas[0]; return {t: n.t, c: n.carril}; }")
        pg.evaluate("(t) => window.__nf.avanzar(t - window.__nf.partida.tiempo)", datos['t'] - 10)
        tecla = 'DFJK'[datos['c']]
        pg.evaluate("window.__nf.avanzar(10)")
        pg.keyboard.press(tecla.lower())
        pr = pg.evaluate("() => ({p: window.__nf.partida.perfectos, b: window.__nf.partida.bien, puntaje: window.__nf.partida.puntaje})")
        comprobar(f'Tecla {tecla} da PERFECTO', pr['p'] == 1 and pr['puntaje'] == 100, pr)
        # La segunda nota se toca con 100 ms de retraso: debe ser "Bien"
        n2 = pg.evaluate("() => { const n = window.__nf.partida.notas[1]; return {t: n.t, c: n.carril}; }")
        pg.evaluate("(t) => window.__nf.avanzar(t - window.__nf.partida.tiempo + 100)", n2['t'])
        pg.evaluate("(c) => window.__nf.pulsar(c)", n2['c'])
        pr = pg.evaluate("() => ({p: window.__nf.partida.perfectos, b: window.__nf.partida.bien})")
        comprobar('Toque tardío (100 ms) da BIEN', pr['b'] == 1, pr)
        # Un toque en un carril sin nota no debe castigar
        vida0 = pg.evaluate("window.__nf.partida.vida")
        pg.evaluate("window.__nf.pulsar(0)")
        comprobar('Tocar sin nota no baja la vida', pg.evaluate("window.__nf.partida.vida") == vida0)
        # Dejar pasar una nota genera Fallo y baja la vida
        pg.evaluate("window.__nf.avanzar(3000)")
        pr = pg.evaluate("() => ({f: window.__nf.partida.fallos, vida: window.__nf.partida.vida, combo: window.__nf.partida.combo})")
        comprobar('Notas ignoradas son Fallo y bajan la vida', pr['f'] > 0 and pr['vida'] < 100 and pr['combo'] == 0, pr)
        captura(pg, '14-juego-fallos')

        # ---------- 7. Partida perdida ----------
        print('\n[7] Partida perdida')
        res = pg.evaluate(JUGAR_SIN_TOCAR)
        comprobar('Sin tocar, la partida se pierde', res['ganada'] is False and res['estrellas'] == 0, res['estrellas'])
        pg.wait_for_selector('.pantalla-resultados'); pg.wait_for_timeout(1800)
        captura(pg, '15-resultados-derrota')
        s = storage(pg)
        comprobar('Perder no guarda estrellas ni desbloquea Difícil', s['progreso']['estrellita']['medio']['estrellas'] == 0)
        comprobar('Perder no entra al ranking', len(s['ranking']) == 1)
        comprobar('Se cuentan las partidas jugadas', s['estadisticas']['partidas'] == 2, s['estadisticas']['partidas'])

        # ---------- 8. Persistencia tras recargar ----------
        print('\n[8] Persistencia entre sesiones')
        antes = storage(pg)
        pg.goto(BASE + '?test=1'); pg.wait_for_timeout(3000)
        pg.locator('.pantalla-splash').click(); pg.wait_for_selector('.pantalla-home'); pg.wait_for_timeout(600)
        comprobar('Datos intactos tras recargar', storage(pg)['progreso'] == antes['progreso'] and storage(pg)['ranking'] == antes['ranking'])
        comprobar('El saludo recuerda el nombre', 'Juan Pablo' in pg.locator('#saludo').inner_text())
        comprobar('Home muestra las estrellas ganadas', pg.locator('#chip-estrellas b').inner_text() == '3')
        pg.click('#btn-puntajes'); pg.wait_for_selector('.pantalla-puntajes'); pg.wait_for_timeout(600)
        comprobar('Ranking muestra 1 fila', pg.locator('.fila-rank').count() == 1)
        captura(pg, '16-puntajes-ranking')
        pg.click('.pestanas [data-tab="mejores"]'); pg.wait_for_timeout(300)
        captura(pg, '17-puntajes-mejores')
        pg.click('#atras'); pg.wait_for_selector('.pantalla-home'); pg.wait_for_timeout(500)

        # ---------- 9. Progresión de canciones ----------
        print('\n[9] Progresión de canciones')
        pg.click('#btn-jugar'); pg.wait_for_selector('.pantalla-canciones'); pg.wait_for_timeout(900)
        comprobar('La 2.ª canción se abre tras ★ en Fácil de la 1.ª', pg.locator('.cancion.bloqueada').count() == 4, pg.locator('.cancion.bloqueada').count())
        captura(pg, '18-canciones-progreso')
        pg.click('#atras'); pg.wait_for_selector('.pantalla-home'); pg.wait_for_timeout(500)

        # ---------- 10. Easter eggs ----------
        print('\n[10] Easter eggs')
        for _ in range(7):
            pg.click('#logo'); pg.wait_for_timeout(120)
        pg.wait_for_timeout(500)
        captura(pg, '19-easter-egg-logo', False)
        s = storage(pg)
        comprobar('7 toques al logo desbloquean la canción secreta', s['secretos']['cancionSecreta'] is True)
        comprobar('Se activa el modo arcoíris', s['ajustes']['arcoiris'] is True)
        pg.wait_for_timeout(3600)
        pg.click('#btn-jugar'); pg.wait_for_selector('.pantalla-canciones'); pg.wait_for_timeout(900)
        comprobar('La canción secreta aparece en la lista (7 tarjetas)', pg.locator('.cancion').count() == 7)
        pg.click('.cancion[data-id="arcoiris"]'); pg.wait_for_selector('.pantalla-niveles'); pg.wait_for_timeout(700)
        pg.click('.nivel[data-nivel="facil"]'); pg.wait_for_selector('.pantalla-juego'); pg.wait_for_timeout(400)
        pg.evaluate(JUGAR_HASTA, 6000)
        captura(pg, '20-juego-modo-arcoiris')
        pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
        pg.click('#btn-salir'); pg.wait_for_selector('.pantalla-niveles'); pg.wait_for_timeout(500)
        comprobar('Salir de la pausa vuelve a la selección de nivel', pg.locator('.pantalla-niveles').count() == 1)
        pg.click('#atras'); pg.wait_for_timeout(400); pg.click('#atras'); pg.wait_for_selector('.pantalla-home'); pg.wait_for_timeout(500)

        # ---------- 11. Créditos ----------
        print('\n[11] Créditos')
        pg.click('#btn-creditos'); pg.wait_for_selector('.pantalla-creditos'); pg.wait_for_timeout(900)
        comprobar('Créditos muestra a 3 integrantes', pg.locator('.integrante').count() == 3)
        comprobar("Créditos dice 'Hecho en UPB'", 'UPB' in pg.locator('#hecho-en').inner_text())
        captura(pg, '21-creditos')
        for _ in range(5):
            pg.click('#hecho-en'); pg.wait_for_timeout(100)
        pg.wait_for_timeout(600)
        comprobar('Easter egg de Créditos (5 toques) se registra', storage(pg)['secretos']['confeti'] is True)
        captura(pg, '22-creditos-confeti')

        # ---------- 12. Bucle en tiempo real (sin reloj manual) ----------
        print('\n[12] Bucle de juego en tiempo real (requestAnimationFrame)')
        pg2 = ctx.new_page()
        pg2.on('pageerror', lambda e: errores_consola.append(str(e)))
        pg2.goto(BASE)   # sin ?test=1: el reloj corre solo
        pg2.wait_for_timeout(3000); pg2.locator('.pantalla-splash').click(); pg2.wait_for_selector('.pantalla-home')
        pg2.wait_for_timeout(600); pg2.click('#btn-jugar'); pg2.wait_for_selector('.pantalla-canciones'); pg2.wait_for_timeout(700)
        pg2.click('.cancion[data-id="estrellita"]'); pg2.wait_for_selector('.pantalla-niveles'); pg2.wait_for_timeout(700)
        pg2.click('.nivel[data-nivel="facil"]'); pg2.wait_for_selector('.pantalla-juego')
        # Un "jugador automático" que toca cuando la nota está a menos de 12 ms de la línea
        pg2.evaluate("""() => { const nf = window.__nf; window.__bot = setInterval(() => { const p = nf.partida;
            for (const n of p.notas) if (n.estado === 0 && Math.abs(n.t - p.tiempo) < 12) nf.pulsar(n.carril); }, 4); }""")
        pg2.wait_for_timeout(9500)
        tiempo = pg2.evaluate("window.__nf.partida.tiempo")
        ok = pg2.evaluate("() => ({p: window.__nf.partida.perfectos + window.__nf.partida.bien, f: window.__nf.partida.fallos})")
        comprobar('El reloj avanza solo en tiempo real', tiempo > 3000, f'{tiempo:.0f} ms')
        comprobar('Se acertaron notas en tiempo real', ok['p'] >= 4, ok)
        captura(pg2, '23-juego-tiempo-real')
        pg2.close()

        comprobar('Sin errores en la consola del navegador', not errores_consola, errores_consola[:3])
        navegador.close()

    # ---------- Resumen ----------
    total = len(resultados)
    bien = sum(1 for _, ok, _ in resultados if ok)
    print(f'\nRESUMEN: {bien}/{total} comprobaciones correctas')
    salida = RAIZ / 'pruebas' / 'salida'
    salida.mkdir(exist_ok=True)
    (salida / 'resultado.json').write_text(json.dumps({'correctas': bien, 'total': total, 'detalle': resultados}, ensure_ascii=False, indent=2))
    sys.exit(0 if bien == total else 1)

if __name__ == '__main__':
    main()
