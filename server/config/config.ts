import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement depuis le fichier .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Définir les types pour les variables d'environnement
interface IConfig {
  // Configuration du serveur
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  frontendUrl: string;
  
  // Configuration de la session
  session: {
    secret: string;
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | 'none' | boolean;
  };
  
  // Configuration JWT
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
    expiresInSeconds: number;
    refreshExpiresInSeconds: number;
    issuer: string;
    audience: string;
  };
  
  // Configuration de l'application
  app: {
    name: string;
    version: string;
    description: string;
    supportEmail: string;
  };
  
  // Configuration de l'API
  api: {
    url: string;
    prefix: string;
  };
  
  // Configuration du client
  client: {
    url: string;
    emailVerificationUrl: string;
    passwordResetUrl: string;
  };
  
  // Configuration de sécurité
  security: {
    // Mot de passe
    password: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    // Verrouillage de compte
    accountLockout: {
      maxLoginAttempts: number;
      lockoutTime: number; // en minutes
    };
    // Jetons de réinitialisation
    resetToken: {
      expiresIn: string; // en heures
    };
    // Vérification d'email
    emailVerification: {
      expiresIn: string; // en heures
    };
  };
  
  // Configuration du hachage de mot de passe
  bcrypt: {
    saltRounds: number;
  };
  
  // Configuration de la base de données
  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    dialect: 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql';
    logging: boolean;
  };
  
  // Configuration des emails (à implémenter plus tard)
  email?: {
    service: string;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
  };
}

// Configuration par défaut
const config: IConfig = {
  // Configuration du serveur
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Configuration de la session
  session: {
    secret: process.env.SESSION_SECRET || 'votre_secret_session_tres_securise',
    maxAge: 24 * 60 * 60 * 1000, // 24h
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  },
  
  // Configuration JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'votre_cle_secrete_tres_securisee',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'votre_cle_rafraichissement_tres_securisee',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    expiresInSeconds: parseInt(process.env.JWT_EXPIRES_IN_SECONDS || '3600', 10), // 1h
    refreshExpiresInSeconds: parseInt(process.env.JWT_REFRESH_EXPIRES_IN_SECONDS || '604800', 10), // 7j
    issuer: process.env.JWT_ISSUER || 'lopango-api',
    audience: process.env.JWT_AUDIENCE || 'lopango-app'
  },
  
  // Configuration de l'application
  app: {
    name: process.env.APP_NAME || 'LOPANGO',
    version: process.env.APP_VERSION || '1.0.0',
    description: 'Plateforme immobilière LOPANGO',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@lopango.com'
  },
  
  // Configuration de l'API
  api: {
    url: process.env.API_URL || 'http://localhost:3001',
    prefix: '/api'
  },
  
  // Configuration du client
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:5173',
    emailVerificationUrl: process.env.EMAIL_VERIFICATION_URL || 'http://localhost:5173/verify-email',
    passwordResetUrl: process.env.PASSWORD_RESET_URL || 'http://localhost:5173/reset-password'
  },
  
  // Configuration de sécurité
  security: {
    // Configuration des mots de passe
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    },
    // Verrouillage de compte
    accountLockout: {
      maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
      lockoutTime: parseInt(process.env.ACCOUNT_LOCKOUT_TIME || '15', 10) // en minutes
    },
    // Jetons de réinitialisation
    resetToken: {
      expiresIn: process.env.RESET_TOKEN_EXPIRES_IN || '1h' // 1 heure par défaut
    },
    // Vérification d'email
    emailVerification: {
      expiresIn: process.env.EMAIL_VERIFICATION_EXPIRES_IN || '24h' // 24 heures par défaut
    }
  },
  
  // Configuration du hachage de mot de passe
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10)
  },
  
  // Configuration de la base de données SQLite
  db: {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    // Configuration pour SQLite
    define: {
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    // Options spécifiques à SQLite
    dialectOptions: {
      // Désactive le mode STRICT pour SQLite
      useUTC: false
    },
    // Configuration du pool de connexions
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // Désactive les logs de requêtes SQL brutes
    benchmark: false,
    // Désactive la mise en cache des requêtes
    query: {
      raw: true
    },
    // Désactive la création automatique des timestamps
    timestamps: true,
    // Active les noms de table au pluriel
    freezeTableName: false
  }
};

// Validation de la configuration
const validateConfig = (): void => {
  // Forcer SQLite pour le développement
  process.env.DB_DIALECT = 'sqlite';
  
  let requiredVars = [
    'PORT',
    'NODE_ENV',
    'FRONTEND_URL',
    'SESSION_SECRET',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'API_URL',
    'CLIENT_URL',
    'EMAIL_VERIFICATION_URL',
    'PASSWORD_RESET_URL',
    'SUPPORT_EMAIL',
    'MAX_LOGIN_ATTEMPTS',
    'ACCOUNT_LOCKOUT_TIME',
    'RESET_TOKEN_EXPIRES_IN',
    'EMAIL_VERIFICATION_EXPIRES_IN',
    'BCRYPT_SALT_ROUNDS'
  ];
  
  // Configuration pour SQLite
  if (process.env.DB_DIALECT === 'sqlite') {
    process.env.DB_STORAGE = './data/database.sqlite';
    requiredVars = requiredVars.filter(v => ![
      'DB_HOST',
      'DB_PORT',
      'DB_NAME',
      'DB_USER',
      'DB_PASSWORD'
    ].includes(v));
  }

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'Erreur de configuration: les variables d\'environnement suivantes sont manquantes:');
    console.error('\x1b[33m%s\x1b[0m', missingVars.join('\n'));
    console.error('\x1b[36m%s\x1b[0m', 'Veuillez copier le fichier .env.example vers .env et renseigner les valeurs manquantes.');
    
    // Afficher un exemple de configuration si en développement
    if (config.nodeEnv === 'development') {
      console.log('\n\x1b[36mExemple de configuration .env :\x1b[0m');
      console.log('PORT=3001');
      console.log('NODE_ENV=development');
      console.log('FRONTEND_URL=http://localhost:5173');
      console.log('SESSION_SECRET=votre_secret_session_tres_securise');
      console.log('JWT_SECRET=votre_cle_secrete_tres_securisee');
      console.log('JWT_REFRESH_SECRET=votre_cle_rafraichissement_tres_securisee');
      console.log('DB_HOST=localhost');
      console.log('DB_PORT=3306');
      console.log('DB_NAME=lopango');
      console.log('DB_USER=root');
      console.log('DB_PASSWORD=');
      console.log('DB_DIALECT=mysql');
      console.log('API_URL=http://localhost:3001');
      console.log('CLIENT_URL=http://localhost:5173');
      console.log('EMAIL_VERIFICATION_URL=http://localhost:5173/verify-email');
      console.log('PASSWORD_RESET_URL=http://localhost:5173/reset-password');
      console.log('SUPPORT_EMAIL=support@lopango.com');
      console.log('MAX_LOGIN_ATTEMPTS=5');
      console.log('ACCOUNT_LOCKOUT_TIME=15');
      console.log('RESET_TOKEN_EXPIRES_IN=1h');
      console.log('EMAIL_VERIFICATION_EXPIRES_IN=24h');
      console.log('BCRYPT_SALT_ROUNDS=12');
    }
    
    process.exit(1);
  }
};

// Valider la configuration au démarrage
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}

export default config;
