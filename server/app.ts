import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { createServer, Server } from 'http';
import { db } from './database';
import config from './config';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/error.middleware';

class App {
  public app: Application;
  public server: Server;
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
    // Middleware de sécurité
    this.app.use(helmet());
    
    // Configuration CORS simplifiée
    const corsOptions = {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        const allowedOrigins = [
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://localhost:3000',
          config.frontendUrl,
          ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
        ];

        // Autoriser les requêtes sans origine (comme les applications mobiles ou curl)
        if (!origin || allowedOrigins.includes(origin) || config.cors.origin === '*') {
          callback(null, true);
        } else {
          console.warn(`[CORS] Origine non autorisée: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Request-ID',
        ...(config.cors.allowedHeaders || [])
      ],
      exposedHeaders: ['Content-Length', 'X-Request-ID'],
      credentials: true,
      optionsSuccessStatus: 200,
      maxAge: 600 // 10 minutes
    };

    // Middleware pour gérer les requêtes OPTIONS (pré-vol)
    this.app.options('*', cors(corsOptions));
    
    // Activer CORS pour toutes les routes
    this.app.use(cors(corsOptions));
    
    // Middleware pour ajouter les en-têtes CORS manuellement
    this.app.use((req, res, next) => {
      // Définir les en-têtes CORS
      const origin = req.headers.origin || '';
      if (corsOptions.origin === '*' || (Array.isArray(corsOptions.origin) && corsOptions.origin.includes(origin))) {
        res.header('Access-Control-Allow-Origin', origin || '*');
      }
      res.header('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
      res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
      res.header('Access-Control-Allow-Credentials', 'true');
      
      // Répondre immédiatement aux requêtes OPTIONS
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      
      next();
    });
    
    // Parse JSON request bodies
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Middleware de journalisation
    this.app.use(morgan('dev'));
    
    // Middleware de compression
    this.app.use(compression());
    
    // Middleware pour parser le JSON
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Middleware pour parser les cookies
    this.app.use(cookieParser());
    
    // Limite de débit pour les requêtes
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limite chaque IP à 100 requêtes par fenêtre
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);
  }

  private initializeRoutes() {
    // Route de santé
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Routes d'authentification
    this.app.use('/api/auth', authRoutes);

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
