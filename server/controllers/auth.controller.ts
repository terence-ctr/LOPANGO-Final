import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op, Transaction } from 'sequelize';
import { sequelize } from '../config/database.js';
import { User } from '../models/User.js';
import logger from '../utils/logger.js';

// Interface pour l'utilisateur nettoyé (sans données sensibles)
interface SanitizedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  emailVerified: boolean;
  status: string;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  address?: string | null;
  identity?: string | null;
  isActive?: boolean;
  mfaEnabled?: boolean;
  phone?: string | null;
  dateOfBirth?: Date | null;
  profileImage?: string | null;
  preferredLanguage?: string | null;
  timezone?: string | null;
  acceptedTerms?: boolean;
  acceptedTermsAt?: Date | null;
  acceptedPrivacyPolicy?: boolean;
  acceptedPrivacyPolicyAt?: Date | null;
  gender?: string | null;
}

export class AuthController {
  // User registration
  static async register(req: Request, res: Response): Promise<Response> {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(2, 10);
    
    logger.info(`[${requestId}] [REGISTER] Starting registration`, { 
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    const transaction = await sequelize.transaction();
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await transaction.rollback();
        logger.warn(`[${requestId}] [REGISTER] Validation errors`, { errors: errors.array() });
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { 
        email, 
        password, 
        firstName, 
        lastName, 
        userType = 'user' 
      } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ 
        where: { email },
        transaction
      });

      if (existingUser) {
        logger.warn(`[${requestId}] [REGISTER] Email already in use`, { email });
        return res.status(400).json({
          success: false,
          code: 'EMAIL_EXISTS',
          message: 'Email already registered'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Créer un nouvel utilisateur avec des valeurs par défaut pour les champs requis
      const newUser = await User.create({
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
        email_verified: false,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
        address: '',
        identity: '',
        is_active: true,
        mfa_enabled: false,
        phone: '',
        date_of_birth: null,
        profile_image: '',
        preferred_language: 'fr',
        timezone: 'Afrique/kinshasa',
        accepted_terms: false,
        accepted_privacy_policy: false,
        gender: null
      }, { transaction });

      // Generate tokens
      const { accessToken, refreshToken } = await AuthController.generateTokens(newUser);
      
      // Update user with refresh token
      await newUser.update({ refresh_token: refreshToken }, { transaction });
      
      // Commit transaction
      await transaction.commit();

      // Préparer la réponse avec toutes les propriétés requises
      const userResponse: SanitizedUser = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.getDataValue('first_name') || '',
        lastName: newUser.getDataValue('last_name') || '',
        userType: newUser.getDataValue('user_type') || 'user',
        emailVerified: Boolean(newUser.getDataValue('email_verified')),
        status: newUser.status || 'active',
        createdAt: newUser.getDataValue('created_at') || new Date(),
        updatedAt: newUser.getDataValue('updated_at') || new Date(),
        address: newUser.getDataValue('address') || null,
        identity: newUser.getDataValue('identity') || null,
        isActive: Boolean(newUser.getDataValue('is_active')),
        mfaEnabled: Boolean(newUser.getDataValue('mfa_enabled')),
        phone: newUser.getDataValue('phone') || null,
        dateOfBirth: newUser.getDataValue('date_of_birth') || null,
        profileImage: newUser.getDataValue('profile_image') || null,
        preferredLanguage: newUser.getDataValue('preferred_language') || 'fr',
        timezone: newUser.getDataValue('timezone') || 'Europe/Paris',
        acceptedTerms: Boolean(newUser.getDataValue('accepted_terms')),
        acceptedTermsAt: newUser.getDataValue('accepted_terms_at') || null,
        acceptedPrivacyPolicy: Boolean(newUser.getDataValue('accepted_privacy_policy')),
        acceptedPrivacyPolicyAt: newUser.getDataValue('accepted_privacy_policy_at') || null,
        gender: newUser.getDataValue('gender') || null
      };

      const responseTime = Date.now() - startTime;
      logger.info(`[${requestId}] [REGISTER] Registration successful`, { 
        userId: newUser.id,
        responseTime: `${responseTime}ms`
      });

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      // Rollback de la transaction en cas d'erreur
      if (transaction) {
        await transaction.rollback();
      }
      
      const errorId = Math.random().toString(36).substring(2, 8);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error(`[${requestId}] [REGISTER] Error during registration`, { 
        error: errorMessage, 
        errorId,
        stack: error instanceof Error ? error.stack : undefined
      });

      return res.status(500).json({
        success: false,
        code: 'REGISTRATION_ERROR',
        message: 'An error occurred during registration',
        errorId
      });
    }
  }

  // User login
  static async login(req: Request, res: Response): Promise<Response> {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(2, 10);
    
    logger.info(`[${requestId}] [LOGIN] Login attempt`, { 
      ip: req.ip,
      userAgent: req.get('user-agent') 
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Démarrer une transaction
    const transaction = await sequelize.transaction();
    
    try {
        // Find user by email
        const user = await User.findOne({ 
          where: { email },
          transaction
        });

        if (!user) {
          await transaction.rollback();
          logger.warn(`[${requestId}] [LOGIN] User not found`, { email });
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials',
            code: 'INVALID_CREDENTIALS'
          });
        }

        // Check if account is locked
        const accountLockedUntil = user.getDataValue('account_locked_until');
        if (accountLockedUntil && new Date(accountLockedUntil) > new Date()) {
          const remainingTime = Math.ceil((new Date(accountLockedUntil).getTime() - Date.now()) / 1000);
          
          logger.warn(`[${requestId}] [LOGIN] Account locked`, { 
            userId: user.id, 
            lockedUntil: accountLockedUntil,
            remainingTime: `${remainingTime}s`
          });
          
          return res.status(403).json({
            success: false,
            message: 'Account locked. Too many failed attempts.',
            code: 'ACCOUNT_LOCKED',
            retryAfter: remainingTime
          });
        }

        // Verify password
        const userPassword = user.getDataValue('password');
        const isPasswordValid = userPassword ? await bcrypt.compare(password, userPassword) : false;
        if (!isPasswordValid) {
          // Increment failed login attempts
          const maxAttempts = 5;
          const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
          
          // Lock account if max attempts reached
          if (newFailedAttempts >= maxAttempts) {
            const lockoutTime = 15 * 60 * 1000; // 15 minutes
            await user.update({
              failedLoginAttempts: 0,
              accountLockedUntil: new Date(Date.now() + lockoutTime)
            }, { transaction });
            
            logger.warn(`[${requestId}] [LOGIN] Account locked after too many attempts`, { 
              userId: user.id,
              lockedUntil: new Date(Date.now() + lockoutTime)
            });
            
            await transaction.commit();
            
            return res.status(403).json({
              success: false,
              message: 'Too many failed attempts. Account locked.',
              code: 'ACCOUNT_LOCKED',
              retryAfter: Math.ceil(lockoutTime / 1000)
            });
          }
          
          // Update failed attempts
          await user.update({ 
            failedLoginAttempts: newFailedAttempts 
          }, { transaction });
          
          await transaction.commit();
          
          return res.status(401).json({ 
            success: false,
            message: 'Invalid credentials',
            code: 'INVALID_CREDENTIALS',
            remainingAttempts: maxAttempts - newFailedAttempts
          });
        }

        // Check if account is active
        if (user.status !== 'active') {
          
          const response: any = {
            success: false,
            message: 'Account not active',
            code: 'ACCOUNT_NOT_ACTIVE',
            status: user.status
          };
          
          if (user.status === 'pending_verification') {
            response.message = 'Please verify your email address';
            response.verificationRequired = true;
          }
          
          return res.status(403).json(response);
        }

        // Generate new tokens
        const { accessToken, refreshToken } = await AuthController.generateTokens(user);
        
        // Update user with new refresh token and reset failed attempts
        await user.update({
          refresh_token: refreshToken,
          last_login: new Date(),
          failedLoginAttempts: 0,
          accountLockedUntil: null
        }, { transaction });
        
        await transaction.commit();

        // Préparer la réponse avec toutes les propriétés requises
        const userData: SanitizedUser = {
          id: user.id,
          email: user.email,
          firstName: user.getDataValue('first_name') || '',
          lastName: user.getDataValue('last_name') || '',
          userType: user.getDataValue('user_type') || 'user',
          emailVerified: Boolean(user.getDataValue('email_verified')),
          status: user.status || 'active',
          lastLogin: user.getDataValue('last_login') || null,
          createdAt: user.getDataValue('created_at') || new Date(),
          updatedAt: user.getDataValue('updated_at') || new Date(),
          address: user.getDataValue('address') || null,
          identity: user.getDataValue('identity') || null,
          isActive: Boolean(user.getDataValue('is_active')),
          mfaEnabled: Boolean(user.getDataValue('mfa_enabled')),
          phone: user.getDataValue('phone') || null,
          dateOfBirth: user.getDataValue('date_of_birth') || null,
          profileImage: user.getDataValue('profile_image') || null,
          preferredLanguage: user.getDataValue('preferred_language') || 'fr',
          timezone: user.getDataValue('timezone') || 'Europe/Paris',
          acceptedTerms: Boolean(user.getDataValue('accepted_terms')),
          acceptedTermsAt: user.getDataValue('accepted_terms_at') || null,
          acceptedPrivacyPolicy: Boolean(user.getDataValue('accepted_privacy_policy')),
          acceptedPrivacyPolicyAt: user.getDataValue('accepted_privacy_policy_at') || null,
          gender: user.getDataValue('gender') || null
        };

        const responseTime = Date.now() - startTime;
        logger.info(`[${requestId}] [LOGIN] Login successful`, { 
          userId: user.id, 
          responseTime: `${responseTime}ms` 
        });
        
        return res.json({
          success: true,
          message: 'Login successful',
          user: userData,
          tokens: {
            accessToken,
            refreshToken
          }
        });

      } catch (error) {
        await transaction.rollback();
        const errorId = Math.random().toString(36).substring(2, 8);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        logger.error(`[${requestId}] [LOGIN] Login failed [${errorId}]`, {
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined
        });
        
        return res.status(500).json({
          success: false,
          code: 'LOGIN_ERROR',
          message: 'Login failed',
          errorId,
          ...(process.env.NODE_ENV === 'development' && { error: errorMessage })
        });
      }
    }

    // Générer les tokens JWT
    private static async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
      const userType = user.getDataValue('user_type');
      const emailVerified = user.getDataValue('email_verified');
      
      // Créer le payload avec les propriétés de base
      const payload = {
        id: user.id,
        email: user.email,
        userType: userType,
        emailVerified: emailVerified,
        isActive: user.getDataValue('is_active'),
        mfaEnabled: user.getDataValue('mfa_enabled')
      };

      // Générer les tokens
      const accessToken = jwt.sign(
        { ...payload, type: 'access' },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { ...payload, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret',
        { expiresIn: '7d' }
      );

      return { accessToken, refreshToken };
    }

    // Get current user profile
    static async getCurrentUser(req: Request, res: Response): Promise<Response> {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Not authenticated' });
      }

      try {
        const user = await User.findByPk(userId, {
          attributes: { exclude: ['password', 'refreshToken'] }
        });

        if (!user) {
          return res.status(404).json({ success: false, code: 'USER_NOT_FOUND', message: 'User not found' });
        }

        // Convertir les noms de colonnes snake_case en camelCase
        const userData: SanitizedUser = {
          id: user.id,
          email: user.email,
          firstName: user.getDataValue('first_name') || '',
          lastName: user.getDataValue('last_name') || '',
          userType: user.getDataValue('user_type') || 'user',
          emailVerified: Boolean(user.getDataValue('email_verified')),
          status: user.getDataValue('status') || 'active',
          lastLogin: user.getDataValue('last_login') || null,
          createdAt: user.getDataValue('created_at') || new Date(),
          updatedAt: user.getDataValue('updated_at') || new Date(),
          address: user.getDataValue('address') || null,
          identity: user.getDataValue('identity') || null,
          isActive: Boolean(user.getDataValue('is_active')),
          mfaEnabled: Boolean(user.getDataValue('mfa_enabled')),
          phone: user.getDataValue('phone') || null,
          dateOfBirth: user.getDataValue('date_of_birth') || null,
          profileImage: user.getDataValue('profile_image') || null,
          preferredLanguage: user.getDataValue('preferred_language') || 'fr',
          timezone: user.getDataValue('timezone') || 'Europe/Paris',
          acceptedTerms: Boolean(user.getDataValue('accepted_terms')),
          acceptedTermsAt: user.getDataValue('accepted_terms_at') || null,
          acceptedPrivacyPolicy: Boolean(user.getDataValue('accepted_privacy_policy')),
          acceptedPrivacyPolicyAt: user.getDataValue('accepted_privacy_policy_at') || null,
          gender: user.getDataValue('gender') || null
        };

        return res.json({ success: true, data: userData });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Error getting current user:', { error: errorMessage });
        return res.status(500).json({ 
          success: false, 
          code: 'SERVER_ERROR', 
          message: 'An error occurred while fetching user profile' 
        });
      }
    }

    // Logout user
    static async logout(req: Request, res: Response): Promise<Response> {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Not authenticated' });
      }

      try {
        // Ici, vous pourriez invalider le refresh token si nécessaire
        // Par exemple, en le supprimant de la base de données
        
        // Pour l'instant, on se contente de logger la déconnexion
        logger.info(`User ${userId} logged out`);
        
        return res.json({ success: true, message: 'Logout successful' });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Error during logout:', { error: errorMessage });
        return res.status(500).json({ 
          success: false, 
          code: 'LOGOUT_ERROR', 
          message: 'An error occurred during logout' 
        });
      }
    }
  }
