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
import dashboardRoutes from './routes/dashboard.routes';
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
    
    // Configuration CORS
    this.app.use(cors({
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Request-ID',
        'Cache-Control',
        'Pragma',
        'access-control-allow-headers',
        'access-control-allow-methods',
        'access-control-allow-origin',
        'x-new-token',
        'x-token-expires-at'
      ],
      exposedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Request-ID',
        'Cache-Control',
        'Pragma',
        'X-New-Token',
        'X-Token-Expires-At',
        'X-New-Refresh-Token'
      ],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204
    }));

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
    
    // Middleware pour configurer les cookies
    this.app.use((req: Request, res: Response, next: NextFunction): void => {
      // La configuration CORS est déjà gérée par le middleware cors()
      // Nous ne configurons que les cookies ici
      
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
    this.app.use('/api/dashboard', dashboardRoutes);
    
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
