import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { LoginDto } from '../utils/dto/auth/auth.dto';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: errors.array()
    });
  }
  next();
};

export const validateLogin = [
  // Validation des champs obligatoires
  (req: Request, res: Response, next: NextFunction) => {
    console.log('=== VALIDATION DE LA CONNEXION ===');
    console.log('Corps de la requête (validation):', JSON.stringify(req.body, null, 2));
    
    const { email, password, userType }: LoginDto = req.body;
    const errors: { field: string; message: string }[] = [];

    if (!email) {
      errors.push({ field: 'email', message: 'L\'email est requis' });
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.push({ field: 'email', message: 'Format d\'email invalide' });
    }

    if (!password) {
      errors.push({ field: 'password', message: 'Le mot de passe est requis' });
    }

    if (!userType) {
      errors.push({ field: 'userType', message: 'Le type d\'utilisateur est requis' });
    } else if (!['tenant', 'landlord', 'agent', 'admin'].includes(userType)) {
      errors.push({ field: 'userType', message: 'Type d\'utilisateur invalide' });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors
      });
    }

    // Normaliser le userType en minuscules
    req.body.userType = userType.toLowerCase().trim();
    next();
  },
  validateRequest
];
