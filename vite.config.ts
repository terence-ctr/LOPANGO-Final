import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Suppression de l'avertissement pour Suspense
          isCustomElement: (tag) => false,
          // Désactivation des commentaires dans le template
          comments: false,
          // Suppression des avertissements pour Suspense
          onWarn: (warning) => {
            if (warning.toString().includes('Suspense')) return;
            console.warn(warning);
          }
        }
      },
      script: {
        // Désactivation de defineModel et de la déstructuration des props
        defineModel: false,
        propsDestructure: false
      }
    })
  ],
  server: {
    proxy: {
      // Configuration du proxy pour toutes les requêtes API
      '^/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        // Réécrire le chemin pour supprimer le préfixe /api avant d'envoyer au serveur
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('Erreur de proxy:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Requête proxy vers:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Réponse de l\'API:', req.method, req.url, '->', proxyRes.statusCode);
          });
        }
      },
      // Autres configurations de proxy si nécessaire
    }
  }
});