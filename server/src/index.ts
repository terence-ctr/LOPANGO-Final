import 'dotenv/config';
import App from './app';
import config from '../config/config';




// Création de l'application
const app = new App(config.port);

// Démarrage du serveur
app.listen().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // En production, vous pourriez vouloir redémarrer le processus ici
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // En production, vous pourriez vouloir redémarrer le processus ici
  process.exit(1);
});

// Gestion de la sortie propre
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu. Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT reçu. Arrêt du serveur...');
  process.exit(0);
});
