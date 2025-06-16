import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware.js';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { UserType } from '../utils/enums/user.enum.js';

const router = Router();

// Validation rules
const registerValidationRules = () => [
  body('email').isEmail().withMessage('Email invalide'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/[0-9]/)
    .withMessage('Le mot de passe doit contenir au moins un chiffre')
    .matches(/[a-z]/)
    .withMessage('Le mot de passe doit contenir au moins une lettre minuscule')
    .matches(/[A-Z]/)
    .withMessage('Le mot de passe doit contenir au moins une lettre majuscule'),
  body('passwordConfirmation')
    .notEmpty().withMessage('La confirmation du mot de passe est requise')
    .custom((value, { req, path }) => {
      console.log('[VALIDATION] Password confirmation check:', {
        value,
        password: req.body.password,
        match: value === req.body.password,
        path
      });
      if (value !== req.body.password) {
        throw new Error('La confirmation du mot de passe ne correspond pas au mot de passe');
      }
      return true;
    })
    .withMessage('Les mots de passe ne correspondent pas'),
  body('firstName').notEmpty().withMessage('Le prénom est requis'),
  body('lastName').notEmpty().withMessage('Le nom est requis'),
  body('phone').notEmpty().withMessage('Le numéro de téléphone est requis'),
  body('dateOfBirth').isISO8601().withMessage('Date de naissance invalide'),
  body('gender')
    .custom(value => {
      if (!value) return false; // Gender is required for registration
      const normalized = String(value).toLowerCase();
      return ['male', 'female', 'other', 'prefer-not-to-say'].includes(normalized);
    })
    .withMessage('Genre invalide. Les valeurs acceptées sont: Male, Female, Other, Prefer not to say'),
  body('userType').isIn(Object.values(UserType)).withMessage('Type d\'utilisateur invalide'),
  
  // Address validation (for address table)
  body('address').isObject().withMessage('L\'adresse est requise'),
  body('address.street').notEmpty().withMessage('La rue est requise'),
  body('address.city').notEmpty().withMessage('La ville est requise'),
  body('address.country').notEmpty().withMessage('Le pays est requis'),
  body('address.postalCode')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Le code postal doit être une chaîne de caractères'),
  body('address.additionalInfo')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Les informations complémentaires doivent être une chaîne de caractères'),
  
  // Identity validation (for identity table)
  body('identity')
    .isObject()
    .withMessage('Les informations d\'identité sont requises')
    .customSanitizer((value) => {
      if (!value) return value;
      
      // Créer un nouvel objet pour éviter les effets de bord
      const sanitized = { ...value };
      
      // S'assurer que le champ est une chaîne
      if (sanitized.nationalId) {
        sanitized.nationalId = String(sanitized.nationalId).trim();
      }
      
      return sanitized;
    })
    .custom((value) => {
      if (!value) {
        throw new Error('Les informations d\'identité sont requises');
      }
      
      // Vérifier que le champ nationalId est présent et non vide
      const hasNationalId = value.nationalId && String(value.nationalId).trim() !== '';
      
      if (!hasNationalId) {
        throw new Error('Le numéro d\'identité nationale est requis (nationalId)');
      }
      
      return true;
    }),
  // La validation du type de document a été supprimée
  body('identity.issuingCountry')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Le pays d\'émission doit être une chaîne de caractères'),
  body('identity.expirationDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('La date d\'expiration doit être une date valide (format: AAAA-MM-JJ)'),
  
  // Terms and conditions
  body('acceptedTerms')
    .exists()
    .withMessage('L\'acceptation des conditions est requise')
    .isBoolean()
    .withMessage('L\'acceptation des conditions d\'utilisation doit être un booléen')
    .custom(value => {
      if (value !== true) {
        throw new Error('Vous devez accepter les conditions d\'utilisation');
      }
      return true;
    }),
  body('acceptedPrivacyPolicy')
    .exists()
    .withMessage('L\'acceptation de la politique de confidentialité est requise')
    .isBoolean()
    .custom(value => value === true)
    .withMessage('Vous devez accepter la politique de confidentialité'),
];

const loginValidationRules = () => [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
    .isString()
    .withMessage('Le mot de passe doit être une chaîne de caractères'),
];

const refreshTokenValidationRules = () => [
  body('refreshToken').notEmpty().withMessage('Le refresh token est requis'),
];

const forgotPasswordValidationRules = () => [
  body('email').isEmail().withMessage('Email invalide'),
];

const resetPasswordValidationRules = () => [
  body('token').notEmpty().withMessage('Le token est requis'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/[0-9]/)
    .withMessage('Le mot de passe doit contenir au moins un chiffre')
    .matches(/[a-z]/)
    .withMessage('Le mot de passe doit contenir au moins une lettre minuscule')
    .matches(/[A-Z]/)
    .withMessage('Le mot de passe doit contenir au moins une lettre majuscule'),
];

const updateProfileValidationRules = () => [
  body('firstName').optional().notEmpty().withMessage('Le prénom ne peut pas être vide'),
  body('lastName').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('phone').optional().notEmpty().withMessage('Le numéro de téléphone ne peut pas être vide'),
  body('dateOfBirth').optional().isISO8601().withMessage('Date de naissance invalide'),
  body('gender')
    .optional()
    .custom(value => {
      if (!value) return true; // Allow empty values if optional
      const normalized = String(value).toLowerCase();
      return ['male', 'female', 'other', 'prefer-not-to-say'].includes(normalized);
    })
    .withMessage('Genre invalide. Les valeurs acceptées sont: Male, Female, Other, Prefer not to say'),
  body('aboutMe').optional().isString().withMessage('La description doit être une chaîne de caractères'),
];

const changePasswordValidationRules = () => [
  body('currentPassword').notEmpty().withMessage('Le mot de passe actuel est requis'),
  body('newPassword')
    .notEmpty().withMessage('Le nouveau mot de passe est requis')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/[0-9]/)
    .withMessage('Le mot de passe doit contenir au moins un chiffre')
    .matches(/[a-z]/)
    .withMessage('Le mot de passe doit contenir au moins une lettre minuscule')
    .matches(/[A-Z]/)
    .withMessage('Le mot de passe doit contenir au moins une lettre majuscule'),
];

// ==================== Routes Publiques ====================

// Inscription d'un nouvel utilisateur
router.post(
  '/register',
  validate(registerValidationRules()),
  AuthController.register
);

// Connexion d'un utilisateur
router.post(
  '/login',
  validate(loginValidationRules()),
  AuthController.login
);

// Rafraîchir le token d'accès
router.post(
  '/refresh-token',
  validate(refreshTokenValidationRules()),
  AuthController.refreshToken
);

// Demande de réinitialisation de mot de passe
router.post(
  '/forgot-password',
  validate(forgotPasswordValidationRules()),
  AuthController.forgotPassword
);

// Réinitialisation du mot de passe
router.post(
  '/reset-password',
  validate(resetPasswordValidationRules()),
  AuthController.resetPassword
);

// ==================== Routes Protégées ====================

// Obtenir les informations de l'utilisateur connecté
router.get(
  '/me',
  authenticate,
  AuthController.getCurrentUser
);

// Mettre à jour le profil de l'utilisateur connecté
router.put(
  '/me',
  authenticate,
  validate(updateProfileValidationRules()),
  AuthController.updateProfile
);

// Changer le mot de passe de l'utilisateur connecté
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordValidationRules()),
  AuthController.changePassword
);

// Déconnexion de l'utilisateur
router.post(
  '/logout',
  authenticate,
  AuthController.logout
);

// ==================== Routes Administrateur ====================
// Obtenir la liste de tous les utilisateurs (admin uniquement)
router.get(
  '/users',
  authenticate,
  authorize('admin'),
  AuthController.getAllUsers
);

export default router;
