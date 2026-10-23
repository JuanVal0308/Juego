// =====================================================================
// main.js - Punto de entrada de NotaFlow
// Registra las pantallas, aplica los ajustes guardados y muestra el Splash.
// =====================================================================
import './estilos/base.css';
import './estilos/splash.css';
import './estilos/pantallas.css';
import './estilos/juego.css';
import './estilos/resultados.css';
import { registrarPantalla, irA, pantallaActual, volver } from './enrutador.js';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import splash from './pantallas/splash.js';
import home from './pantallas/home.js';
import ajustes from './pantallas/ajustes.js';
import ayuda from './pantallas/ayuda.js';
import seleccionCancion from './pantallas/seleccion-cancion.js';
import seleccionNivel from './pantallas/seleccion-nivel.js';
import juego from './pantallas/juego.js';
import resultados from './pantallas/resultados.js';
import puntajes from './pantallas/puntajes.js';
import creditos from './pantallas/creditos.js';

registrarPantalla('splash', splash);
registrarPantalla('home', home);
registrarPantalla('ajustes', ajustes);
registrarPantalla('ayuda', ayuda);
registrarPantalla('canciones', seleccionCancion);
registrarPantalla('niveles', seleccionNivel);
registrarPantalla('juego', juego);
registrarPantalla('resultados', resultados);
registrarPantalla('puntajes', puntajes);
registrarPantalla('creditos', creditos);

irA('splash');

// ---------------------------------------------------------------------
// Botón "atrás" de Android (plugin @capacitor/app):
//  - En el juego pausa/reanuda.
//  - En Splash o Home cierra la app.
//  - En otras pantallas vuelve a la anterior.
// En el navegador de escritorio este bloque no hace nada.
// ---------------------------------------------------------------------

if (Capacitor.isNativePlatform()) {
  App.addListener('backButton', () => {
    const actual = pantallaActual();
    if (actual === 'juego') window.dispatchEvent(new Event('nf:atras'));
    else if (actual === 'splash' || actual === 'home') App.exitApp();
    else if (!volver()) irA('home', {}, { reemplazar: true });
  });
}
