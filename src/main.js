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

registrarPantalla('splash', splash);
registrarPantalla('home', home);
registrarPantalla('ajustes', ajustes);
registrarPantalla('ayuda', ayuda);

irA('splash');
