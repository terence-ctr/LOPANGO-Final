import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    userType?: string;
    // Ajoutez d'autres propriétés de session personnalisées ici si nécessaire
  }
}

// Ceci étend le type Request d'Express pour inclure la session
declare global {
  namespace Express {
    interface Request {
      session: any; // Utilisez un type plus précis si possible
    }
  }
}
