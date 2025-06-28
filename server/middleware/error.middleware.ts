import { Request, Response, NextFunction } from 'express';

/**
 * Importation de Joi pour la validation de schémas
 * Note: Dans les versions récentes de Joi, ValidationError doit être extrait de l'objet Joi par défaut
 * plutôt que d'être importé directement comme un export nommé.
 */
import Joi from 'joi';
const { ValidationError } = Joi;

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('\n===== ERREUR =====');
  console.error('Date:', new Date().toISOString());
  console.error('URL:', req.originalUrl);
  console.error('Méthode:', req.method);
  console.error('Headers:', req.headers);
  console.error('Body:', req.body);
  console.error('Erreur complète:', err);
  console.error('===== FIN ERREUR =====\n');
  console.error('Erreur:', err);

  // Erreur de validation Joi
  if (err instanceof ValidationError) {
    return res.status(400).json({
      message: 'Erreur de validation',
      errors: err.details.map((detail) => ({
        message: detail.message,
        field: detail.path.join('.'),
      })),
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token invalide' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expiré' });
  }

  // Erreur de duplication dans la base de données (SQLite)
  if (err.code === 'SQLITE_CONSTRAINT' || err.code === '23505') {
    return res.status(409).json({
      message: 'Une entrée avec ces données existe déjà',
      field: err.column || 'inconnu',
    });
  }

  // Erreur personnalisée avec statut
  if (err.statusCode) {
    // Vérifier que le code de statut est un nombre valide
    const statusCode = Number(err.statusCode);
    if (isNaN(statusCode) || statusCode < 100 || statusCode > 599) {
      console.error('Code de statut invalide:', err.statusCode);
      return res.status(500).json({
        message: 'Erreur interne du serveur',
        error: err.message,
        ...(err.errors && { errors: err.errors }),
      });
    }
    return res.status(statusCode).json({
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Erreur inattendue
  console.error('Erreur inattendue:', err);
  res.status(500).json({
    message: 'Une erreur est survenue sur le serveur',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
};

// Classe d'erreur personnalisée
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: any[]
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Erreur 404
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(404, `Route non trouvée - ${req.originalUrl}`);
  next(error);
};

// Gestion des promesses rejetées non capturées
process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Ici, vous pourriez envoyer une notification à l'équipe de développement
});

// Gestion des exceptions non capturées
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  // Ici, vous pourriez envoyer une notification à l'équipe de développement
  process.exit(1); // Arrêter le processus car l'application est dans un état instable
});
