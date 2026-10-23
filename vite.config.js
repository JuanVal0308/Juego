// Configuración de Vite: empaqueta el juego en la carpeta "dist",
// que es la que Capacitor copia dentro de la app Android.
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // rutas relativas para que funcione dentro del WebView de Android
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
  },
  server: { port: 5173 },
});
