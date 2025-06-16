import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Suppression de l'avertissement pour Suspense
          isCustomElement: (tag) => false,
          // Désactivation des commentaires dans le template
          comments: false
        }
      },
      script: {
        // Désactivation de defineModel et de la déstructuration des props
        defineModel: false,
        propsDestructure: false
      },
      // Configuration pour supprimer les avertissements de fonctionnalités expérimentales
      compilerOptions: {
        // Suppression des avertissements pour Suspense
        warnHandler: (warning, warn) => {
          if (warning.toString().includes('Suspense')) return;
          warn(warning);
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
});