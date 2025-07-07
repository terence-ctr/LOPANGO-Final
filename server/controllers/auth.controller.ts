import { Request, Response, NextFunction, CookieOptions } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { db } from '../database';
import { uploadFiles, getFileUrl } from '../utils/fileUpload';
import { 
  RegisterDto, 
  LoginDto, 
  AuthResponseDto,
  TokenPayload, 
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto
} from '../utils/dto/auth/auth.dto';
import { IUser } from '../utils/interfaces/user.interface';
import { UserType, UserTypeEnum } from '../utils/enums/user.enum';

// Les types de fichiers sont déjà définis par @types/multer

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Fonction utilitaire pour générer les tokens
const generateTokens = (userId: string, userType: UserType) => {
  const expiresIn = parseInt(JWT_EXPIRES_IN) * 60; // en secondes
  
  const accessToken = jwt.sign(
    { id: userId, type: userType },
    JWT_SECRET as jwt.Secret,
    { expiresIn: expiresIn.toString() + 's' } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh' },
    JWT_SECRET as jwt.Secret,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN } as jwt.SignOptions
  );

  return { 
    accessToken, 
    refreshToken,
    expiresIn
  };
};

// Fonction utilitaire pour formater la réponse utilisateur
const formatUserResponse = (user: any) => {
  // Vérifier si l'utilisateur utilise _id ou id
  const userId = user._id || user.id;
  
  // Vérifier si userType est défini, sinon utiliser user_type
  const userType = user.userType || user.user_type;
  
  // Vérifier si emailVerified est défini, sinon utiliser email_verified
  const emailVerified = user.emailVerified || user.email_verified;
  
  // Vérifier si isActive est défini, sinon utiliser is_active
  const isActive = typeof user.isActive !== 'undefined' ? user.isActive : user.is_active;
  
  console.log('Formatage de la réponse utilisateur:', {
    userId,
    userType,
    emailVerified,
    isActive,
    rawUser: user
  });

  return {
    id: userId,
    email: user.email,
    firstName: user.firstName || user.first_name,
    lastName: user.lastName || user.last_name,
    userType: userType,
    emailVerified: emailVerified,
    profilePicture: user.profilePicture || user.profile_picture,
    isActive: isActive,
    phone: user.phone,
    gender: user.gender,
    createdAt: user.createdAt || user.created_at,
    updatedAt: user.updatedAt || user.updated_at
  };
};

/**
 * Middleware pour gérer le téléchargement des fichiers
 */
export const handleFileUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadFiles(req as any, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Erreur lors du téléchargement des fichiers',
      });
    }
    next();
  });
};

/**
 * Enregistrement d'un nouvel utilisateur
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  const trx = await db.transaction();
  
  try {
    // Récupérer les fichiers téléchargés avec un type sûr
    const files = req.files as Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined;
    const fileMap = Array.isArray(files) 
      ? { files } 
      : files || {};
    
    // Vérifier si des fichiers ont été reçus
    console.log('=== FICHIERS REÇUS ===');
    console.log('Document recto:', fileMap['documentFront']?.length ? 'Oui' : 'Non');
    console.log('Document verso:', fileMap['documentBack']?.length ? 'Oui' : 'Non');
    
    // Parser les champs du formulaire
    const formData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    // Parser les données d'identité si elles sont fournies
    let identityData = {};
    if (formData.identity) {
      identityData = typeof formData.identity === 'string' 
        ? JSON.parse(formData.identity) 
        : formData.identity;
    }
    
    // Préparer les données du formulaire
    const userData: RegisterDto = {
      ...formData,
      // Convertir les champs booléens
      acceptTerms: formData.acceptTerms === true || formData.acceptTerms === 'true',
      acceptPrivacyPolicy: formData.acceptPrivacyPolicy === true || formData.acceptPrivacyPolicy === 'true',
      // Gérer les fichiers téléchargés
      identity: {
        ...identityData,
        frontDocumentUrl: (Array.isArray(fileMap['documentFront']) && fileMap['documentFront'][0]?.filename) || '',
        backDocumentUrl: (Array.isArray(fileMap['documentBack']) && fileMap['documentBack'][0]?.filename) || '',
      },
    };
    
    console.log('=== DONNÉES DU FORMULAIRE ===');
    console.log('Email:', userData.email);
    console.log('Prénom:', userData.firstName);
    console.log('Nom:', userData.lastName);
    console.log('Téléphone:', userData.phone);
    console.log('Type d\'utilisateur:', userData.userType);
    console.log('Date de naissance:', userData.dateOfBirth);
    console.log('Adresse:', userData.address);
    console.log('Identité:', userData.identity);
    
    // Log des données reçues pour débogage
    console.log('=== DONNÉES REÇUES LORS DE L\'INSCRIPTION ===');
    console.log('Email:', userData.email);
    console.log('Prénom:', userData.firstName);
    console.log('Nom:', userData.lastName);
    console.log('Téléphone:', userData.phone);
    console.log('Type d\'utilisateur:', userData.userType);
    console.log('Date de naissance:', userData.dateOfBirth);
    console.log('Genre:', userData.gender);
    console.log('Accepté les CGU:', userData.acceptTerms);
    console.log('Accepté la politique de confidentialité:', userData.acceptPrivacyPolicy);
    
    console.log('--- Adresse ---');
    if (userData.address) {
      console.log('Rue:', userData.address.street);
      console.log('Ville:', userData.address.city);
      console.log('Code postal:', userData.address.postalCode);
      console.log('Pays:', userData.address.country);
    } else {
      console.log('Aucune adresse fournie');
    }
    
    console.log('--- Identité ---');
    if (userData.identity) {
      console.log('Type de document:', userData.identity.documentType);
      console.log('Numéro de document:', userData.identity.documentNumber);
      console.log('Date d\'émission:', userData.identity.issueDate);
      console.log('Autorité émettrice:', userData.identity.issuingAuthority);
      console.log('Pays émetteur:', userData.identity.issuingCountry);
      console.log('Document recto:', userData.identity.frontDocumentUrl ? 'fourni' : 'manquant');
      console.log('Document verso:', userData.identity.backDocumentUrl ? 'fourni' : 'manquant');
    } else {
      console.log('Aucune information d\'identité fournie');
    }
    console.log('======================================');

    // Vérification de l'email désactivée pour le débogage
    console.log('=== VÉRIFICATION DE L\'EMAIL DÉSACTIVÉE ===');
    console.log('Contournement de la vérification pour l\'email:', userData.email);
    
    // Ancien code de vérification d'email désactivé
    try {
      const query = trx('users').where('email', userData.email).toSQL();
      console.log('📝 Requête SQL qui aurait été exécutée:');
      console.log('   SQL:', query.sql);
      console.log('   Bindings:', query.bindings);
      
      console.log('✅ Vérification d\'email contournée pour le débogage');
    } catch (error: unknown) {
      console.error('❌ Erreur inattendue:', error);
      await trx.rollback();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        success: false,
        message: 'Erreur inattendue lors du traitement',
        code: 'UNEXPECTED_ERROR',
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
    
    // Vérifier si le numéro d'identité existe déjà
    if (userData.identity?.documentNumber) {
      console.log('\n=== VÉRIFICATION DU NUMÉRO D\'IDENTITÉ ===');
      console.log('Recherche d\'une identité avec le numéro:', userData.identity.documentNumber);
      
      try {
        const query = trx('identities').where('national_id', userData.identity.documentNumber).toSQL();
        console.log('📝 Requête SQL générée pour la recherche d\'identité:');
        console.log('   SQL:', query.sql);
        console.log('   Bindings:', query.bindings);
        
        const existingIdentity = await trx('identities')
          .where('national_id', userData.identity.documentNumber)
          .first();
          
        if (existingIdentity) {
          console.error('❌ Identité existante trouvée avec ce numéro:', {
            id: existingIdentity.id,
            national_id: existingIdentity.national_id,
            created_at: existingIdentity.created_at
          });
          
          // Vérifier toutes les identités dans la base pour le débogage
          const allIdentities = await trx('identities').select('id', 'national_id', 'created_at');
          console.log('📋 Liste de toutes les identités dans la base:', allIdentities);
          
          await trx.rollback();
          return res.status(409).json({
            success: false,
            message: 'Ce numéro d\'identité est déjà utilisé',
            code: 'IDENTITY_NUMBER_ALREADY_EXISTS',
            existingIdentity: {
              id: existingIdentity.id,
              national_id: existingIdentity.national_id,
              created_at: existingIdentity.created_at
            }
          });
        } else {
          console.log('✅ Aucune identité existante trouvée avec ce numéro');
        }
      } catch (error: unknown) {
        console.error('❌ Erreur lors de la vérification du numéro d\'identité:', error);
        await trx.rollback();
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la vérification du numéro d\'identité',
          code: 'IDENTITY_VERIFICATION_ERROR',
          error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
      }
    }

    // Vérifier les fichiers d'identité avec un type sûr
    const frontDocument = Array.isArray(fileMap['documentFront']) ? fileMap['documentFront'][0] : undefined;
    const backDocument = Array.isArray(fileMap['documentBack']) ? fileMap['documentBack'][0] : undefined;
    
    if (frontDocument) {
      console.log('Vérification du fichier d\'identité recto:', frontDocument.filename);
      // Vérifier si le fichier existe déjà en base (par son nom de fichier)
      const existingFrontFile = await trx('identities')
        .where('document_front_url', frontDocument.filename)
        .orWhere('document_back_url', frontDocument.filename)
        .first();
      
      if (existingFrontFile) {
        console.log('Un fichier avec ce nom (recto) existe déjà, annulation de l\'inscription');
        await trx.rollback();
        return res.status(409).json({
          success: false,
          message: 'Un fichier avec ce nom existe déjà',
          code: 'DUPLICATE_FILE_NAME',
          fileType: 'frontDocument'
        });
      }
    }
    
    if (backDocument) {
      console.log('Vérification du fichier d\'identité verso:', backDocument.filename);
      // Vérifier si le fichier existe déjà en base (par son nom de fichier)
      const existingBackFile = await trx('identities')
        .where('document_front_url', backDocument.filename)
        .orWhere('document_back_url', backDocument.filename)
        .first();
      
      if (existingBackFile) {
        console.log('Un fichier avec ce nom (verso) existe déjà, annulation de l\'inscription');
        await trx.rollback();
        return res.status(409).json({
          success: false,
          message: 'Un fichier avec ce nom existe déjà',
          code: 'DUPLICATE_FILE_NAME',
          fileType: 'backDocument'
        });
      }
    }
    
    // Vérifier l'acceptation des CGU et de la politique de confidentialité
    if (!userData.acceptTerms || !userData.acceptPrivacyPolicy) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: 'Vous devez accepter les conditions générales et la politique de confidentialité'
      });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const emailVerificationToken = uuidv4();
    const emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures
    const now = new Date();

    // Créer l'adresse
    const addressData: any = {
      street: userData.address.street,
      city: userData.address.city,
      postal_code: userData.address.postalCode || '',
      country: userData.address.country,
      user_id: null, // Sera mis à jour après la création de l'utilisateur
      created_at: now,
      updated_at: now
    };
    
    console.log('Données d\'adresse à insérer:', addressData);
    
    // Insérer l'adresse sans user_id pour le moment
    const [addressId] = await trx('addresses').insert(addressData);
    console.log('Adresse insérée avec l\'ID:', addressId);
    
    if (typeof addressId !== 'number' || isNaN(addressId)) {
      console.error('Erreur: Impossible de déterminer l\'ID d\'adresse valide');
      throw new Error('Échec de la récupération de l\'ID d\'adresse');
    }
    
    console.log('Address ID final:', addressId, 'Type:', typeof addressId);

    // Créer l'identité
    const documentTypeMap: Record<string, string> = {
      'passport': 'passeport',
      'id_card': 'carte_identite',
      'driver_license': 'permis_conduire',
      'permis_conduire': 'permis_conduire',
      'passeport': 'passeport',
      'carte_identite': 'carte_identite'
    };
    
    const mappedDocumentType = documentTypeMap[userData.identity.documentType] || 'carte_identite';
    
    const identityDataToInsert = {
      document_type: mappedDocumentType,
      national_id: userData.identity.documentNumber,
      document_front_url: userData.identity.frontDocumentUrl,
      document_back_url: userData.identity.backDocumentUrl,
      verified: false,
      user_id: null, // Sera mis à jour après la création de l'utilisateur
      created_at: now,
      updated_at: now
    };
    
    console.log('Type de document mappé:', userData.identity.documentType, '->', mappedDocumentType);
    console.log('Données d\'identité à insérer:', identityDataToInsert);
    
    // Insérer l'identité sans user_id pour le moment
    const [identityId] = await trx('identities').insert(identityDataToInsert);
    console.log('Identité insérée avec l\'ID:', identityId);
    
    if (typeof identityId !== 'number' || isNaN(identityId)) {
      console.error('Erreur: Impossible de déterminer l\'ID d\'identité valide');
      throw new Error('Échec de la récupération de l\'ID d\'identité');
    }
    
    console.log('Identity ID final:', identityId, 'Type:', typeof identityId);

    // Créer l'utilisateur
    console.log('\n=== CRÉATION DE L\'UTILISATEUR ===');
    console.log('Tentative de création de l\'utilisateur avec l\'email:', userData.email);
    
    // Préparer les données utilisateur
    const userInsertData = {
      email: userData.email,
      password: hashedPassword,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone,
      date_of_birth: userData.dateOfBirth,
      gender: userData.gender,
      user_type: userData.userType,
      email_verification_token: emailVerificationToken,
      email_verification_expire: emailVerificationExpire,
      accepted_terms: true,
      accepted_terms_at: now,
      accepted_privacy_policy: true,
      accepted_privacy_policy_at: now,
      is_active: true,
      email_verified: false,
      failed_login_attempts: 0,
      mfa_enabled: false,
      created_at: now,
      updated_at: now
    };
    
    // Afficher la requête SQL qui va être exécutée
    const query = trx('users').insert(userInsertData).toSQL();
    console.log('📝 Requête SQL générée pour l\'insertion utilisateur:');
    console.log('   SQL:', query.sql);
    console.log('   Bindings:', query.bindings);
    
    // Insérer l'utilisateur d'abord
    const [userId] = await trx('users').insert(userInsertData);
    console.log('✅ Utilisateur créé avec succès avec l\'ID:', userId);
    console.log('   Type de l\'ID retourné:', typeof userId);
    
    // Mettre à jour l'adresse avec l'ID de l'utilisateur
    console.log('Mise à jour de l\'adresse ID', addressId, 'avec user_id:', userId);
    await trx('addresses')
      .where('id', addressId)
      .update({ user_id: userId });
    
    // Mettre à jour l'identité avec l'ID de l'utilisateur
    console.log('Mise à jour de l\'identité ID', identityId, 'avec user_id:', userId);
    await trx('identities')
      .where('id', identityId)
      .update({ user_id: userId });
    
    // Mettre à jour l'utilisateur avec les ID d'adresse et d'identité
    console.log('Mise à jour de l\'utilisateur avec address_id:', addressId, 'et identity_id:', identityId);
    await trx('users')
      .where('id', userId)
      .update({
        address_id: addressId,
        identity_id: identityId
      });
    
    // Vérifier la présence effective de l'utilisateur dans la base
    const createdUser = await trx('users').where('id', userId).first();
    if (!createdUser) {
      const errorMsg = 'Échec de la création de l\'utilisateur: Utilisateur non trouvé après création';
      console.error(`❌ ${errorMsg}`);
      
      // Vérifier les tables pour le débogage
      const usersCount = await trx('users').count('* as count').first();
      const addressesCount = await trx('addresses').count('* as count').first();
      const identitiesCount = await trx('identities').count('* as count').first();
      
      console.error('📊 État de la base de données au moment de l\'erreur:', {
        usersCount: usersCount?.count || 0,
        addressesCount: addressesCount?.count || 0,
        identitiesCount: identitiesCount?.count || 0
      });
      
      await trx.rollback();
      return res.status(500).json({
        success: false,
        message: errorMsg,
        code: 'USER_CREATION_FAILED',
        details: process.env.NODE_ENV === 'development' ? {
          usersCount: usersCount?.count || 0,
          addressesCount: addressesCount?.count || 0,
          identitiesCount: identitiesCount?.count || 0
        } : undefined
      });
    }
    
    console.log('✅ Utilisateur créé avec succès avec l\'ID:', userId);
    
    // Valider que les clés étrangères sont bien définies
    if (!createdUser.address_id || !createdUser.identity_id) {
      console.error('❌ ERREUR: Les clés étrangères ne sont pas correctement définies', {
        address_id: createdUser.address_id,
        identity_id: createdUser.identity_id
      });
      
      await trx.rollback();
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du compte: échec de la définition des relations',
        code: 'RELATIONSHIP_CREATION_FAILED',
        details: process.env.NODE_ENV === 'development' ? {
          address_id: createdUser.address_id,
          identity_id: createdUser.identity_id
        } : undefined
      });
    }
    
    // Valider que l'utilisateur a bien été créé avec les bonnes relations
    const finalUser = await trx('users')
      .leftJoin('addresses', 'users.address_id', 'addresses.id')
      .leftJoin('identities', 'users.identity_id', 'identities.id')
      .where('users.id', userId)
      .select([
        'users.*',
        'addresses.street',
        'addresses.city',
        'identities.document_type',
        'identities.national_id'
      ])
      .first();
    
    if (!finalUser) {
      console.error('❌ ERREUR: Impossible de récupérer les données complètes de l\'utilisateur après création');
      await trx.rollback();
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des données du compte',
        code: 'USER_DATA_RETRIEVAL_FAILED'
      });
    }
    
    // Valider que l'adresse et l'identité ont bien l'ID de l'utilisateur
    const address = await trx('addresses').where('id', createdUser.address_id).first();
    const identity = await trx('identities').where('id', createdUser.identity_id).first();
    
    if (!address || !identity) {
      console.error('❌ ERREUR: Impossible de vérifier les relations de l\'utilisateur', {
        addressExists: !!address,
        identityExists: !!identity
      });
      await trx.rollback();
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification des relations du compte',
        code: 'RELATIONSHIP_VERIFICATION_FAILED',
        details: process.env.NODE_ENV === 'development' ? {
          addressExists: !!address,
          identityExists: !!identity
        } : undefined
      });
    }
    
    if (address.user_id !== userId || identity.user_id !== userId) {
      console.error('❌ ERREUR: Incohérence dans les relations utilisateur', {
        addressUserId: address.user_id,
        identityUserId: identity.user_id,
        expectedUserId: userId
      });
      await trx.rollback();
      return res.status(500).json({
        success: false,
        message: 'Incohérence détectée dans les données du compte',
        code: 'DATA_INCONSISTENCY',
        details: process.env.NODE_ENV === 'development' ? {
          addressUserId: address.user_id,
          identityUserId: identity.user_id,
          expectedUserId: userId
        } : undefined
      });
    }
    
    // Générer les tokens JWT avant de valider la transaction
    const { accessToken, refreshToken } = generateTokens(finalUser.id.toString(), finalUser.user_type);
    
    // Enregistrer le refresh token en base de données
    await trx('refresh_tokens').insert({
      user_id: finalUser.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // Tout s'est bien passé, on valide la transaction
    await trx.commit();
    
    // Préparer la réponse
    const userResponse = {
      id: finalUser.id,
      email: finalUser.email,
      firstName: finalUser.first_name,
      lastName: finalUser.last_name,
      phone: finalUser.phone,
      userType: finalUser.user_type,
      isActive: finalUser.is_active,
      emailVerified: finalUser.email_verified,
      address: {
        id: finalUser.address_id,
        street: finalUser.street,
        city: finalUser.city
      },
      identity: {
        id: finalUser.identity_id,
        documentType: finalUser.document_type,
        documentNumber: finalUser.national_id
      },
      createdAt: finalUser.created_at,
      updatedAt: finalUser.updated_at
    };
    
    console.log('✅ Inscription réussie pour l\'utilisateur:', userResponse.email);
    
    // Répondre avec succès
    return res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
    
  } catch (error: any) {
    console.error('❌ ERREUR CRITIQUE lors de l\'inscription:', error);
    
    // S'assurer que la transaction est bien rollback en cas d'erreur
    if (trx) {
      await trx.rollback();
    }
    
    // Gestion des erreurs de contrainte
    if (error.code === 'SQLITE_CONSTRAINT' || error.code === '23505') {
      // Vérifier si c'est une contrainte sur l'email
      if (error.message && error.message.includes('users.email')) {
        console.error('Erreur: Email déjà utilisé');
        return res.status(409).json({
          success: false,
          message: 'Un compte avec cet email existe déjà',
          code: 'EMAIL_ALREADY_EXISTS'
        });
      }
      // Vérifier si c'est une contrainte sur l'identité
      else if (error.message && error.message.includes('users.identity_id')) {
        console.error('Erreur: Problème avec la clé étrangère identity_id');
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la création du compte: problème avec l\'identité',
          code: 'IDENTITY_FK_ERROR'
        });
      }
      // Vérifier si c'est une contrainte sur l'adresse
      else if (error.message && error.message.includes('users.address_id')) {
        console.error('Erreur: Problème avec la clé étrangère address_id');
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la création du compte: problème avec l\'adresse',
          code: 'ADDRESS_FK_ERROR'
        });
      }
      // Pour les autres erreurs de contrainte
      else {
        console.error('Erreur de contrainte SQL:', error.message);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la création du compte: contrainte non gérée',
          code: 'UNHANDLED_CONSTRAINT_ERROR',
          details: process.env.NODE_ENV === 'development' ? {
            error: error.message,
            code: error.code,
            constraint: error.constraint
          } : undefined
        });
      }
    }
    
    // Pour les autres types d'erreurs
    console.error('Erreur inattendue lors de la création du compte:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la création du compte',
      code: 'INTERNAL_SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Connexion d'un utilisateur
 */
// Fonction utilitaire pour gérer les erreurs de transaction
const handleTransactionError = async (trx: any, error: any) => {
  if (trx) {
    try {
      await trx.rollback();
    } catch (rollbackError) {
      console.error('Erreur lors du rollback de la transaction:', rollbackError);
    }
  }
  console.error('Erreur lors de la connexion:', error);
  throw error;
};

// Fonction utilitaire pour exécuter une requête dans une transaction
const executeInTransaction = async (callback: (trx: any) => Promise<any>) => {
  const trx = await db.transaction();
  try {
    const result = await callback(trx);
    await trx.commit();
    return result;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  console.log('=== DÉBUT DE LA CONNEXION ===');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Corps de la requête:', JSON.stringify(req.body, null, 2));
  
  try {
    const { email, password, userType: requestedUserType }: LoginDto = req.body;
    
    console.log('Données extraites de la requête:', {
      email,
      hasPassword: !!password,
      requestedUserType
    });

    // Valider les données d'entrée
    if (!email || !password || !requestedUserType) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis (email, mot de passe, type d\'utilisateur)'
      });
    }

    // Exécuter la logique de connexion dans une transaction
    const result = await executeInTransaction(async (trx) => {
      // Trouver l'utilisateur par email
      const user = await trx('users')
        .where('email', email)
        .first();

      if (!user) {
        return { 
          success: false, 
          status: 401, 
          message: 'Email ou mot de passe incorrect' 
        };
      }

      // Vérifier si le compte est actif
      if (user.is_active !== 1) {
        return { 
          success: false, 
          status: 403, 
          message: 'Votre compte est désactivé. Veuillez contacter le support.' 
        };
      }

      // Vérifier le type d'utilisateur
      console.log('Vérification du type d\'utilisateur:', {
        userTypeFromDB: user.user_type,
        requestedUserType,
        userId: user.id,
        userEmail: user.email
      });
      
      if (user.user_type !== requestedUserType) {
        return { 
          success: false, 
          status: 403, 
          message: 'Type de compte incorrect. Veuillez vous connecter avec le bon type de compte.' 
        };
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        // Incrémenter le compteur de tentatives échouées
        await trx('users')
          .where('id', user.id)
          .increment('failed_login_attempts', 1);
        
        return { 
          success: false, 
          status: 401, 
          message: 'Email ou mot de passe incorrect' 
        };
      }

      // Réinitialiser le compteur de tentatives échouées
      await trx('users')
        .where('id', user.id)
        .update({
          failed_login_attempts: 0,
          last_login: new Date(),
          updated_at: new Date()
        });

      // Générer les tokens
      const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
      
      const accessToken = jwt.sign(
        { id: user.id, type: 'access', userType: user.user_type },
        JWT_SECRET,
        { expiresIn: '15m' }
      );
      
      const refreshToken = jwt.sign(
        { id: user.id, type: 'refresh', userType: user.user_type },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Sauvegarder le refresh token dans la base de données avec les métadonnées
      await trx('refresh_tokens').insert({
        user_id: user.id,
        token: refreshToken,
        expires_at: refreshTokenExpiry,
        created_at: new Date(),
        created_by_ip: req.ip,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      // Formater la réponse utilisateur
      const userResponse = formatUserResponse(user);
      
      // Normaliser le userType
      console.log('Normalisation du userType avant réponse:', {
        originalUserType: userResponse.userType,
        userId: userResponse.id
      });
      
      const validUserTypes = ['tenant', 'landlord', 'agent', 'admin'];
      if (userResponse.userType) {
        userResponse.userType = userResponse.userType.toString().toLowerCase().trim();
        
        // S'assurer que le userType est valide
        if (!validUserTypes.includes(userResponse.userType)) {
          console.warn(`Type d'utilisateur invalide pour l'utilisateur ${userResponse.id}: ${userResponse.userType}, utilisation de 'tenant' par défaut`);
          userResponse.userType = 'tenant';
        }
      } else {
        // Si pas de userType défini, utiliser 'tenant' comme valeur par défaut
        userResponse.userType = 'tenant';
        console.warn(`Aucun type d'utilisateur défini pour l'utilisateur ${userResponse.id}, utilisation de 'tenant' par défaut`);
      }

      // Retourner la réponse de succès
      return {
        success: true,
        status: 200,
        message: 'Connexion réussie',
        data: {
          user: userResponse,
          tokens: {
            accessToken,
            refreshToken,
            expiresAt: accessTokenExpiry.toISOString()
          }
        },
        headers: {
          'X-Access-Token': accessToken,
          'X-Expires-At': accessTokenExpiry.toISOString()
        },
        cookies: {
          name: 'refreshToken',
          value: refreshToken,
          options: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? '.votredomaine.com' : undefined
          }
        }
      };
    });

    // Gérer la réponse de la transaction
    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        message: result.message || 'Une erreur est survenue lors de la connexion'
      });
    }

    // Définir les en-têtes de réponse
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        res.setHeader(key, value as string);
      });
    }

    // Définir le cookie de rafraîchissement
    if (result.cookies) {
      res.cookie(
        result.cookies.name,
        result.cookies.value,
        result.cookies.options
      );
    }

    // Renvoyer la réponse
    return res.status(200).json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Erreur inattendue lors de la connexion :', error);
    next(error);
  }
};

/**
 * Rafraîchir le token d'accès
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  const trx = await db.transaction();
  
  try {
    // Essayer d'abord de récupérer le refresh token depuis le cookie
    let refreshTokenValue = req.cookies?.refreshToken;
    
    // Si non trouvé dans les cookies, essayer dans le corps de la requête (pour rétrocompatibilité)
    if (!refreshTokenValue && req.body.refreshToken) {
      refreshTokenValue = req.body.refreshToken;
    }

    if (!refreshTokenValue) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: 'Le refresh token est requis'
      });
    }

    // Vérifier le refresh token
    let decoded: TokenPayload;
    try {
      decoded = jwt.verify(refreshTokenValue, JWT_SECRET) as TokenPayload;
    } catch (error) {
      await trx.rollback();
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(403).json({
          success: false,
          message: 'Token invalide'
        });
      }
      throw error;
    }
    
    if (decoded.type !== 'refresh') {
      await trx.rollback();
      return res.status(403).json({
        success: false,
        message: 'Type de token invalide'
      });
    }

    // Vérifier si le token existe dans la base de données
    const token = await trx('refresh_tokens')
      .where('token', refreshTokenValue)
      .where('revoked', false)
      .first();

    if (!token || new Date(token.expires_at) < new Date()) {
      await trx.rollback();
      return res.status(403).json({
        success: false,
        message: 'Token expiré ou révoqué'
      });
    }

    // Récupérer l'utilisateur
    const user = await trx('users')
      .where('id', token.user_id)
      .first();

    if (!user) {
      await trx.rollback();
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé' 
      });
    }

    // Vérifier si le compte est actif
    if (!user.is_active) {
      await trx.rollback();
      return res.status(403).json({
        success: false,
        message: 'Ce compte est désactivé'
      });
    }

    // Générer de nouveaux tokens
    const { accessToken, refreshToken: newRefreshToken, expiresIn } = generateTokens(user.id, user.user_type);

    // Révocation de l'ancien token avec mise à jour de replaced_by_token
    await trx('refresh_tokens')
      .where('id', token.id)
      .update({
        revoked: true,
        revoked_at: new Date(),
        replaced_by_token: newRefreshToken,
        updated_at: new Date()
      });

    // Enregistrer le nouveau refresh token avec les métadonnées
    await trx('refresh_tokens').insert({
      user_id: user.id,
      token: newRefreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      created_at: new Date(),
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });

    // Configuration des cookies sécurisés
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.votredomaine.com' : undefined
    };

    // Définir le nouveau refresh token dans un cookie HTTP-only sécurisé
    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    // Valider la transaction
    await trx.commit();

    // Préparer la réponse
    const response: AuthResponseDto = {
      user: formatUserResponse(user),
      tokens: {
        accessToken,
        refreshToken: newRefreshToken, // Utiliser le nouveau refreshToken généré
        expiresIn: parseInt(JWT_EXPIRES_IN) * 60 // en secondes
      }
    };

    res.status(200).json({
      success: true,
      data: response,
      message: 'Token rafraîchi avec succès'
    });

  } catch (error) {
    await trx.rollback();
    console.error('Erreur lors du rafraîchissement du token :', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(403).json({
        success: false,
        message: 'Token expiré'
      });
    }
    
    next(error);
  }
};

export const logout = async (req: Request, res: Response) => {
  const trx = await db.transaction();
  
  try {
    // Récupérer le refresh token depuis le cookie ou le corps de la requête
    let refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      await trx.rollback();
      return res.status(400).json({ 
        success: false,
        message: 'Refresh token requis' 
      });
    }

    // Révoker le refresh token dans la base de données
    await trx('refresh_tokens')
      .where('token', refreshToken)
      .update({
        revoked: true,
        revoked_at: new Date(),
        updated_at: new Date(),
        revoked_by_ip: req.ip
      });
    
    // Valider la transaction
    await trx.commit();
    
    // Supprimer le cookie de refresh token
    res.clearCookie('refreshToken', {
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.votredomaine.com' : undefined,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
    
    res.json({ 
      success: true,
      message: 'Déconnexion réussie' 
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion :', error);
    res.status(500).json({ message: 'Erreur lors de la déconnexion' });
  }
};

// Middleware d'authentification
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // L'utilisateur est déjà attaché à la requête par le middleware d'authentification
    if (!req.user) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    // Récupérer les informations complètes de l'utilisateur depuis la base de données
    const user = await db('users')
      .select(
        'id',
        'email',
        'first_name as firstName',
        'last_name as lastName',
        'phone',
        'gender',
        'user_type as userType',
        'is_active as isActive',
        'email_verified as emailVerified',
        'created_at as createdAt',
        'updated_at as updatedAt'
      )
      .where('id', req.user.id)
      .first();

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // S'assurer que le userType est en minuscules et valide
    const validUserTypes = ['tenant', 'landlord', 'agent', 'admin'];
    if (user.userType) {
      user.userType = user.userType.toString().toLowerCase().trim();
      
      // Si le userType n'est pas valide, utiliser 'tenant' comme valeur par défaut
      if (!validUserTypes.includes(user.userType)) {
        console.warn(`Type d'utilisateur invalide pour l'utilisateur ${user.id}: ${user.userType}, utilisation de 'tenant' par défaut`);
        user.userType = 'tenant';
      }
    } else {
      // Si pas de userType défini, utiliser 'tenant' comme valeur par défaut
      user.userType = 'tenant';
      console.warn(`Aucun type d'utilisateur défini pour l'utilisateur ${user.id}, utilisation de 'tenant' par défaut`);
    }

    // Vérifier si le compte est actif
    if (user.isActive === false) {
      return res.status(403).json({ 
        success: false,
        message: 'Votre compte est désactivé. Veuillez contacter le support.' 
      });
    }

    res.json({ 
      success: true,
      data: user 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des informations utilisateur' });
  }
};

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
