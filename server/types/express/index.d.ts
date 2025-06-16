import { SanitizedUser } from '../../types';

declare global {
  namespace Express {
    interface Request {
      user?: SanitizedUser;
      // Ajoutez d'autres propriétés personnalisées ici si nécessaire
    }
  }
}

// Ce fichier étend les types de base d'Express avec nos types personnalisés
