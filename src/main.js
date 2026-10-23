// =====================================================================
// main.js - Punto de entrada de NotaFlow
// Registra las pantallas, aplica los ajustes guardados y muestra el Splash.
// =====================================================================
import './estilos/base.css';
import './estilos/splash.css';
import { registrarPantalla, irA } from './enrutador.js';
import splash from './pantallas/splash.js';

registrarPantalla('splash', splash);

irA('splash');
