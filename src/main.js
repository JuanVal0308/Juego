// =====================================================================
// main.js - Punto de entrada de NotaFlow
// Registra las pantallas, aplica los ajustes guardados y muestra el Splash.
// =====================================================================
import './estilos/base.css';
import './estilos/splash.css';
import './estilos/pantallas.css';
import { registrarPantalla, irA } from './enrutador.js';
import splash from './pantallas/splash.js';
import home from './pantallas/home.js';
import ajustes from './pantallas/ajustes.js';
import ayuda from './pantallas/ayuda.js';
import seleccionCancion from './pantallas/seleccion-cancion.js';
import seleccionNivel from './pantallas/seleccion-nivel.js';

registrarPantalla('splash', splash);
registrarPantalla('home', home);
registrarPantalla('ajustes', ajustes);
registrarPantalla('ayuda', ayuda);
registrarPantalla('canciones', seleccionCancion);
registrarPantalla('niveles', seleccionNivel);

irA('splash');
