import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import config from './config';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';
import { db } from './database/db';
import { Knex } from 'knex';
import { authRoutes } from './routes/auth.routes';
import propertyRoutes from './routes/property.routes';
import propertyMetadataRoutes from './routes/propertyMetadata.routes';
import contractRoutes from './routes/contract.routes';
import userRoutes from './routes/user.routes';
// Les imports et initialisations liés aux paiements ont été supprimés

// Les routes suivantes sont commentées car les fichiers correspondants n'existent pas encore
// import { userRoutes } from './routes/user.routes';
// import { uploadRoutes } from './routes/upload.routes';
// import { notificationRoutes } from './routes/notification.routes';
// import { messageRoutes } from './routes/message.routes';
// import { reviewRoutes } from './routes/review.routes';
// import { paymentRoutes } from './routes/payment.routes';
// import { searchRoutes } from './routes/search.routes';
// import { reportRoutes } from './routes/report.routes';
// import { adminRoutes } from './routes/admin.routes';

class App {
  public app: Application;
  public server: HttpServer;
  public port: number;

  constructor(port?: number) {
    this.app = express();
    this.port = port || +config.port;
    this.server = createServer(this.app);

    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private async initializeDatabase() {
    try {
      // Tester la connexion à la base de données
      await db.raw('SELECT 1');
      console.log('✅ Connexion à la base de données établie avec succès');
    } catch (error) {
      console.error('❌ Erreur de connexion à la base de données :', error);
      process.exit(1);
    }
  }

  private initializeMiddlewares() {
    // Middleware de débogage pour les requêtes entrantes
    this.app.use((req, res, next) => {
      console.log('=== REQUÊTE REÇUE ===');
      console.log(`Méthode: ${req.method}`);
      console.log(`URL: ${req.originalUrl}`);
      console.log('Headers:', req.headers);
      console.log('Body:', req.body);
      console.log('========================');
      next();
    });
    
    // Middleware de sécurité
    this.app.use(helmet());
    
    // Servir les fichiers statiques depuis le dossier uploads
    this.app.use('/uploads', express.static('uploads'));
    
    // Configuration CORS complète
    const corsOptions = {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        const allowedOrigins = [
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://localhost:3000',
          config.frontendUrl,
          ...(process.env.NODE_ENV === 'development' ? [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:8080',
            'http://127.0.0.1:8080',
            'http://localhost:8081',
            'http://127.0.0.1:8081'
          ] : [])
        ];

        // En développement, accepter toutes les origines pour faciliter les tests
        if (process.env.NODE_ENV === 'development') {
          return callback(null, true);
        }

        // En production, vérifier l'origine
        if (!origin || allowedOrigins.includes(origin) || config.cors?.origin === '*') {
          callback(null, true);
        } else {
          console.warn(`[CORS] Origine non autorisée: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Request-ID',
        'X-Auth-Token',
        'X-Refresh-Token',
        'Accept-Encoding',
        'Content-Length',
        'Cache-Control',
        'Pragma',
        'If-Modified-Since',
        'X-CSRF-Token',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Credentials',
        'Set-Cookie',
        'Cookie',
        ...(config.cors.allowedHeaders || [])
      ],
      exposedHeaders: [
        'Content-Length',
        'X-Request-ID',
        'Content-Disposition',
        'X-Filename',
        'X-Auth-Token',
        'X-Refresh-Token',
        'X-Total-Count',
        'X-Pagination',
        'Set-Cookie',
        'Authorization'
      ],
      credentials: true,
      optionsSuccessStatus: 204, // Certains navigateurs ont des problèmes avec 200
      maxAge: 86400, // 24 heures
      preflightContinue: false,
      optionsPreflight: true
    };

    // Configuration CORS pour les requêtes OPTIONS (pré-vol)
    this.app.options('*', cors(corsOptions));
    
    // Configuration CORS pour toutes les autres requêtes
    this.app.use(cors(corsOptions));
    
    // Middleware pour ajouter les en-têtes CORS manuellement
    this.app.use((req: Request, res: Response, next: NextFunction): void => {
      // Définir les en-têtes CORS
      const origin = req.headers.origin || '';
      
      // Vérifier si l'origine est autorisée
      const allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        config.frontendUrl
      ];
      
      const isOriginAllowed = allowedOrigins.includes(origin) || 
        (Array.isArray(corsOptions.origin) && corsOptions.origin.some(o => 
          typeof o === 'string' && o === origin
        ));
      
      if (isOriginAllowed) {
        res.header('Access-Control-Allow-Origin', origin);
      }
      
      res.header('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
      res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Expose-Headers', corsOptions.exposedHeaders.join(', '));
      
      // Répondre immédiatement aux requêtes OPTIONS (pré-vol)
      if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
      }
      
      next();
    });
    
    // Middleware pour logger les en-têtes CORS (en développement)
    if (process.env.NODE_ENV === 'development') {
      this.app.use((req: Request, res: Response, next: NextFunction): void => {
        console.log('[CORS] Headers de la requête:', {
          origin: req.headers.origin,
          'access-control-request-method': req.headers['access-control-request-method'],
          'access-control-request-headers': req.headers['access-control-request-headers'],
          cookie: req.headers.cookie ? '***' : undefined
        });
        next();
      });
    }
    
    // Middleware de journalisation (avant les parsers pour voir les requêtes brutes)
    this.app.use(morgan('dev'));
    
    // Middleware pour parser les cookies
    this.app.use(cookieParser());
    
    // Middleware pour parser le JSON
    this.app.use(express.json({
      limit: '50mb',
      verify: (req: any, res, buf) => {
        req.rawBody = buf.toString();
      }
    }));
    
    // Middleware pour parser les données de formulaire
    this.app.use(express.urlencoded({ 
      extended: true,
      limit: '50mb'
    }));
    
    // Middleware de compression
    this.app.use(compression());
    
    // Middleware pour configurer les en-têtes CORS et les cookies
    this.app.use((req: Request, res: Response, next: NextFunction): void => {
      // Définir les en-têtes CORS
      const origin = req.headers.origin;
      if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      }
      
      // Gérer les requêtes OPTIONS (prévol)
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
      
      // Configurer les attributs des cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
        domain: process.env.NODE_ENV === 'production' ? '.votredomaine.com' : 'localhost',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours en millisecondes
      };
      
      // Si nous avons un refresh token dans la réponse, le définir dans les cookies
      if ((res as any).locals.refreshToken) {
        res.cookie('refreshToken', (res as any).locals.refreshToken, {
          ...cookieOptions,
          maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
        });
      }
      
      next();
    });
    
    // Configuration du rate limiting
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limite chaque IP à 1000 requêtes par fenêtre pour les routes API standard
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard.'
    });

    // Limite plus stricte pour les routes d'authentification
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limite chaque IP à 100 requêtes d'authentification par fenêtre
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Trop de tentatives de connexion, veuillez réessayer plus tard.'
    });

    // Limite plus stricte pour le rafraîchissement de token
    const refreshTokenLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 30, // Limite chaque IP à 30 requêtes de rafraîchissement par fenêtre
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Trop de tentatives de rafraîchissement de token, veuillez réessayer plus tard.'
    });

    // Appliquer les limiteurs aux routes spécifiques
    this.app.use('/api/auth/refresh-token', refreshTokenLimiter);
    this.app.use('/api/auth', authLimiter);
    this.app.use('/api', apiLimiter);
  }

  private initializeRoutes() {
    // Routes API
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/properties', propertyRoutes);
    this.app.use('/api/property-metadata', propertyMetadataRoutes);
    this.app.use('/api/contracts', contractRoutes);
    this.app.use('/api/users', userRoutes);
    
    // Route de test
    this.app.get('/api/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Gestion des routes non trouvées
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ message: 'Route non trouvée' });
    });
  }

  private initializeErrorHandling() {
    // Gestionnaire d'erreurs global
    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      errorHandler(err, req, res, next);
    });
  }

  public listen() {
    this.server.listen(this.port, () => {
      console.log(`🚀 Serveur démarré sur le port ${this.port}`);
      console.log(`🌍 Environnement: ${config.nodeEnv}`);
      console.log(`📅 ${new Date().toLocaleString()}`);
    });
  }
}

export default App;
