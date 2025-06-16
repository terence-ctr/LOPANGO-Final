import { body, param } from 'express-validator';

// Types de rôles utilisateur valides
export const validUserTypes = ['tenant', 'landlord', 'agent', 'admin'] as const;

export const registerValidationRules = () => {
  return [
    // Validation de l'email
    body('email')
      .trim()
      .notEmpty().withMessage('L\'email est requis')
      .isEmail().withMessage('Veuillez fournir un email valide')
      .normalizeEmail(),
    
    // Validation du mot de passe
    body('password')
      .notEmpty().withMessage('Le mot de passe est requis')
      .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
      .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une minuscule')
      .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule')
      .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre')
      .matches(/[^a-zA-Z0-9]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial'),
    
    // Validation du type d'utilisateur
    body('userType')
      .notEmpty().withMessage('Le type d\'utilisateur est requis')
      .isIn(validUserTypes).withMessage(`Le type d'utilisateur doit être l'un des suivants: ${validUserTypes.join(', ')}`),
    
    // Validation des champs optionnels
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
      
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
      
    body('phone')
      .optional()
      .trim()
      .matches(/^[0-9+\s-]+$/).withMessage('Numéro de téléphone invalide')
  ];
};

export const loginValidationRules = () => {
  return [
    body('email')
      .trim()
      .notEmpty().withMessage('L\'email est requis')
      .isEmail().withMessage('Veuillez fournir un email valide'),
      
    body('password')
      .notEmpty().withMessage('Le mot de passe est requis'),
      
    body('userType')
      .notEmpty().withMessage('Le type d\'utilisateur est requis')
      .isIn(validUserTypes).withMessage(`Type d'utilisateur invalide`)
  ];
};

export const updateProfileValidationRules = () => {
  return [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
      
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
      
    body('phone')
      .optional()
      .trim()
      .matches(/^[0-9+\s-]+$/).withMessage('Numéro de téléphone invalide'),
      
    body('address.street')
      .optional()
      .trim()
      .isLength({ min: 3 }).withMessage('La rue doit contenir au moins 3 caractères'),
      
    body('address.city')
      .optional()
      .trim()
      .isLength({ min: 2 }).withMessage('La ville doit contenir au moins 2 caractères'),
      
    body('address.postalCode')
      .optional()
      .trim()
      .isPostalCode('any').withMessage('Code postal invalide'),
      
    body('address.country')
      .optional()
      .trim()
      .isLength({ min: 2 }).withMessage('Le pays doit contenir au moins 2 caractères')
  ];
};

export const changePasswordValidationRules = () => {
  return [
    body('currentPassword')
      .notEmpty().withMessage('Le mot de passe actuel est requis'),
      
    body('newPassword')
      .notEmpty().withMessage('Le nouveau mot de passe est requis')
      .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
      .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une minuscule')
      .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule')
      .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre')
      .matches(/[^a-zA-Z0-9]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial')
      .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
          throw new Error('Le nouveau mot de passe doit être différent de l\'ancien');
        }
        return true;
      }),
      
    body('confirmPassword')
      .notEmpty().withMessage('La confirmation du mot de passe est requise')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        return true;
      })
  ];
};

export const forgotPasswordValidationRules = () => {
  return [
    body('email')
      .trim()
      .notEmpty().withMessage('L\'email est requis')
      .isEmail().withMessage('Veuillez fournir un email valide')
      .normalizeEmail()
  ];
};

export const resetPasswordValidationRules = () => {
  return [
    body('token')
      .notEmpty().withMessage('Le token de réinitialisation est requis'),
      
    body('newPassword')
      .notEmpty().withMessage('Le nouveau mot de passe est requis')
      .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
      .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une minuscule')
      .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule')
      .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre')
      .matches(/[^a-zA-Z0-9]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial'),
      
    body('confirmPassword')
      .notEmpty().withMessage('La confirmation du mot de passe est requise')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        return true;
      })
  ];
};

export const emailVerificationValidationRules = () => {
  return [
    param('token')
      .notEmpty().withMessage('Le token de vérification est requis')
      .isString().withMessage('Le token doit être une chaîne de caractères')
      .isLength({ min: 10 }).withMessage('Le token est invalide')
  ];
};
