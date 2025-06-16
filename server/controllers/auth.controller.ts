import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { RegisterData, LoginCredentials, AuthResponse } from '../../src/types/auth.types';
import { User, UserType } from '../../src/types/user.types';

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Types personnalisés
type UserFromDB = Omit<User, 'id'> & { id: number };

// Fonction utilitaire pour générer les tokens
const generateTokens = (userId: number, userType: UserType) => {
  const accessToken = jwt.sign(
    { id: userId, type: userType },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const userData: RegisterData = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db('users').where('email', userData.email).first();
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    // Définir les genres valides exactement comme dans la base de données
    const validGenders = ['male', 'female', 'other'] as const;
    type ValidGender = typeof validGenders[number];
    
    // Normaliser le genre en minuscules et supprimer les espaces
    const normalizedGender = userData.gender 
      ? String(userData.gender).toLowerCase().trim() as ValidGender 
      : null;
    
    // Vérifier si le genre est valide
    if (!normalizedGender || !validGenders.includes(normalizedGender)) {
      return res.status(400).json({ 
        success: false,
        message: 'Genre invalide', 
        details: `Le genre doit être l'une des valeurs suivantes : ${validGenders.join(', ')}`,
        received: userData.gender,
        normalized: normalizedGender || 'null'
      });
    }
    
    // S'assurer que la valeur est bien en minuscules pour la base de données
    userData.gender = normalizedGender;

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Démarrer une transaction
    const trx = await db.transaction();

    try {
      console.log('Début de la création de l\'utilisateur...');
      // Créer l'utilisateur
      console.log('Insertion de l\'utilisateur dans la base de données...');
      const result = await trx('users').insert({
        email: userData.email,
        password: hashedPassword,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        date_of_birth: new Date(userData.dateOfBirth),
        gender: userData.gender,
        user_type: userData.userType,
        email_verified: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // Pour SQLite, le résultat est un tableau avec l'ID inséré
      const userId = Array.isArray(result) ? result[0] : result;
      
      console.log('Résultat de l\'insertion utilisateur:', { result, userId });
      
      // S'assurer que l'ID est un nombre
      const parsedUserId = typeof userId === 'object' && userId !== null ? userId.id : userId;
      const finalUserId = Number(parsedUserId);
      
      if (isNaN(finalUserId)) {
        throw new Error(`ID utilisateur invalide: ${JSON.stringify(userId)}`);
      }
      
      console.log('ID utilisateur final:', finalUserId);

      // Créer l'adresse avec l'ID utilisateur final
      const addressData = {
        user_id: finalUserId,
        street: userData.address.street,
        city: userData.address.city,
        postal_code: userData.address.postalCode,
        country: userData.address.country,
        additional_info: userData.address.additionalInfo || null,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      console.log('Création de l\'adresse avec les données:', addressData);
      
      try {
        console.log('Tentative d\'insertion de l\'adresse avec les données:', JSON.stringify(addressData, null, 2));
        await trx('addresses').insert(addressData);
        console.log('Adresse créée avec succès');
      } catch (error) {
        console.error('Erreur lors de la création de l\'adresse:', error);
        throw error; // Relancer l'erreur pour qu'elle soit gérée par le bloc catch externe
      }

      // Créer l'identité
      await trx('identities').insert({
        user_id: finalUserId,
        document_type: userData.identity.documentType,
        national_id: userData.identity.nationalId,
        document_front_url: userData.identity.documentFrontUrl || null,
        document_back_url: userData.identity.documentBackUrl || null,
        verified: false,
        created_at: new Date(),
        updated_at: new Date()
      });

      // Valider la transaction
      await trx.commit();

      // Générer les tokens
      const { accessToken, refreshToken } = generateTokens(finalUserId, userData.userType);

      // Enregistrer le refresh token en base de données
      await db('refresh_tokens').insert({
        user_id: userId,
        token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        created_at: new Date(),
        updated_at: new Date()
      });

      // Préparer la réponse
      const user = await db('users')
        .where('id', userId)
        .select('id', 'email', 'first_name', 'last_name', 'user_type', 'email_verified', 'is_active')
        .first();

      const response: AuthResponse = {
        user,
        token: accessToken,
        refreshToken,
        expiresIn: 3600 // 1 heure en secondes
      };

      res.status(201).json(response);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de l\'inscription :', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe }: LoginCredentials = req.body;

    // Vérifier si l'utilisateur existe
    const user = await db('users').where('email', email).first();
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier si le compte est actif
    if (!user.is_active) {
      return res.status(403).json({ message: 'Ce compte est désactivé' });
    }

    // Générer les tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.user_type);

    // Enregistrer le refresh token en base de données
    await db('refresh_tokens').insert({
      user_id: user.id,
      token: refreshToken,
      expires_at: rememberMe 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      created_at: new Date(),
      updated_at: new Date()
    });

    // Mettre à jour la date de dernière connexion
    await db('users')
      .where('id', user.id)
      .update({ last_login: new Date() });

    // Préparer la réponse
    const { password: _, ...userWithoutPassword } = user;
    const response: AuthResponse = {
      user: userWithoutPassword,
      token: accessToken,
      refreshToken,
      expiresIn: 3600 // 1 heure en secondes
    };

    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token requis' });
    }

    // Vérifier le refresh token dans la base de données
    const tokenData = await db('refresh_tokens')
      .where('token', refreshToken)
      .where('expires_at', '>', new Date())
      .where('revoked', false)
      .first();

    if (!tokenData) {
      return res.status(403).json({ message: 'Refresh token invalide ou expiré' });
    }

    // Vérifier le token JWT
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { id: number; type: string };
    
    if (decoded.type !== 'refresh') {
      return res.status(403).json({ message: 'Token invalide' });
    }

    // Récupérer l'utilisateur
    const user = await db('users')
      .where('id', decoded.id)
      .select('id', 'email', 'first_name', 'last_name', 'user_type', 'email_verified', 'is_active')
      .first();

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Générer un nouveau token d'accès
    const { accessToken: newAccessToken } = generateTokens(user.id, user.user_type);

    res.json({
      token: newAccessToken,
      refreshToken,
      user,
      expiresIn: 3600 // 1 heure en secondes
    });
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token :', error);
    res.status(500).json({ message: 'Erreur lors du rafraîchissement du token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token requis' });
    }

    // Révoker le refresh token
    await db('refresh_tokens')
      .where('token', refreshToken)
      .update({
        revoked: true,
        revoked_at: new Date(),
        updated_at: new Date()
      });

    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Erreur lors de la déconnexion :', error);
    res.status(500).json({ message: 'Erreur lors de la déconnexion' });
  }
};

// Middleware d'authentification
export const authenticateJWT = async (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; type: string };
      
      // Vérifier si l'utilisateur existe toujours
      const user = await db('users')
        .where('id', decoded.id)
        .select('id', 'email', 'first_name', 'last_name', 'user_type', 'email_verified', 'is_active')
        .first();

      if (!user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }

      // Ajouter l'utilisateur à la requête
      (req as any).user = user;
      next();
    } catch (error) {
      return res.status(403).json({ message: 'Token invalide ou expiré' });
    }
  } else {
    res.status(401).json({ message: 'Token d\'authentification manquant' });
  }
};

// Middleware de contrôle d'accès par rôle
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: Function) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    if (!roles.includes(user.user_type)) {
      return res.status(403).json({ message: 'Droits insuffisants' });
    }

    next();
  };
};
