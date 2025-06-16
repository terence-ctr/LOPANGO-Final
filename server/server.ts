import App from './app';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Créer une instance de l'application
const app = new App();

// Démarrer le serveur
app.listen();

// Gestion des erreurs non capturées
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Gestion de la sortie propre
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Arrêt en cours...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Arrêt en cours...');
  process.exit(0);
});
