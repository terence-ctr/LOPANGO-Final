import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { createServer, Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler';
import authRoutes from '../routes/auth.routes';
import userRoutes from '../routes/user.routes';
import propertyRoutes from '../routes/property.routes';
import adminRoutes from '../routes/admin.routes';
import config from '../config/config';
import { testConnection } from '../config/database';

class App {
  public app: Application;
  public server: Server;
  public io: SocketIOServer;
  public port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-request-id'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeWebSocket();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      const success = await testConnection();
      if (!success) {
        throw new Error('Failed to connect to the database');
      }
      console.log('Database connection established successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    }
  }

  private initializeMiddlewares(): void {
    // Enable CORS with proper configuration
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      config.frontendUrl
    ].filter(Boolean); // Remove any undefined values

    const corsOptions = {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (config.nodeEnv === 'development' || allowedOrigins.includes(origin)) {
          console.log(`[CORS] Allowing request from origin: ${origin}`);
          return callback(null, true);
        }
        
        console.warn(`[CORS] Blocked request from origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'x-request-id',
        'x-access-token',
        'x-refresh-token'
      ],
      exposedHeaders: [
        'x-request-id',
        'x-access-token',
        'x-refresh-token',
        'Content-Disposition'
      ],
      credentials: true,
      maxAge: 86400, // 24 hours
      preflightContinue: false,
      optionsSuccessStatus: 204
    };

    // Apply CORS middleware
    this.app.use(cors(corsOptions));
    
    // Handle preflight requests
    this.app.options('*', cors(corsOptions));

    // Raw body parser for webhooks and other raw body needs
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.originalUrl === '/api/webhook' || req.originalUrl.includes('stripe')) {
        next();
      } else {
        express.json()(req, res, next);
      }
    });

    // Standard body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser());

    // Enhanced request logging middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      const { method, originalUrl, ip, headers } = req;
      const requestId = headers['x-request-id'] || `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Add request ID to response headers
      res.setHeader('X-Request-ID', requestId);
      
      // Log incoming request
      const logData: any = {
        method,
        url: originalUrl,
        ip,
        requestId,
        headers: {
          'content-type': headers['content-type'],
          'user-agent': headers['user-agent'],
          origin: headers['origin'],
          referer: headers['referer']
        }
      };
      
      // Log request body (sanitized)
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        const body = { ...req.body };
        if (body.password) body.password = '***';
        if (body.newPassword) body.newPassword = '***';
        if (body.currentPassword) body.currentPassword = '***';
        logData.body = body;
      }
      
      console.log(`[${new Date().toISOString()}] [${requestId}] ${method} ${originalUrl}`, logData);
      
      // Log response when finished
      const originalSend = res.send;
      res.send = function(body) {
        const responseTime = Date.now() - start;
        const responseLog: any = {
          statusCode: res.statusCode,
          responseTime: `${responseTime}ms`,
          headers: res.getHeaders()
        };
        
        // Log response body for errors
        if (res.statusCode >= 400) {
          try {
            const responseBody = typeof body === 'string' ? JSON.parse(body) : body;
            responseLog.response = responseBody;
          } catch (e) {
            responseLog.response = body;
          }
        }
        
        console.log(`[${new Date().toISOString()}] [${requestId}] ${method} ${originalUrl} - ${res.statusCode} (${responseTime}ms)`, responseLog);
        return originalSend.call(this, body);
      };
      
      // Handle response errors
      res.on('error', (error) => {
        console.error(`[${new Date().toISOString()}] [${requestId}] Response error:`, {
          error: error.message,
          stack: error.stack,
          url: originalUrl,
          method,
          statusCode: res.statusCode
        });
      });
      
      // Continue to next middleware
      next();
    });
    
    // Security middleware
    this.app.use(helmet());
    
    // Limiteur de requêtes
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limite chaque IP à 100 requêtes par fenêtre
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Autres middlewares
    this.app.use(compression());

    // Logging en développement
    if (config.nodeEnv === 'development') {
      this.app.use(morgan('dev'));
    }
  }

  private initializeRoutes(): void {
    // Middleware de log pour les routes
    const routeLogger = (req: Request, res: Response, next: NextFunction) => {
      const requestId = req.headers['x-request-id'] || 'no-request-id';
      console.log(`[${new Date().toISOString()}] [${requestId}] [ROUTE] ${req.method} ${req.originalUrl}`);
      next();
    };
    
    // Routes API avec logging
    this.app.use('/api/auth', routeLogger, authRoutes);
    this.app.use('/api/users', routeLogger, userRoutes);
    this.app.use('/api/properties', routeLogger, propertyRoutes);
    this.app.use('/api/admin', routeLogger, adminRoutes);

    // Route de santé
    this.app.get('/health', (req: Request, res: Response) => {
      const requestId = req.headers['x-request-id'] || 'no-request-id';
      console.log(`[${new Date().toISOString()}] [${requestId}] [HEALTH] Vérification de l'état du serveur`);
      
      res.status(200).json({ 
        status: 'UP', 
        timestamp: new Date().toISOString(),
        env: config.nodeEnv,
        memoryUsage: process.memoryUsage()
      });
    });
    
    // Route de test CORS
    this.app.get('/api/test-cors', (req: Request, res: Response) => {
      const requestId = req.headers['x-request-id'] || 'no-request-id';
      console.log(`[${new Date().toISOString()}] [${requestId}] [TEST-CORS] Requête de test CORS reçue`);
      
      res.status(200).json({
        success: true,
        message: 'Test CORS réussi',
        timestamp: new Date().toISOString(),
        headers: {
          origin: req.headers.origin,
          'x-request-id': requestId
        }
      });
    });
  }

  private initializeErrorHandling(): void {
    // Gestion des erreurs 404
    this.app.use(notFoundHandler);
    
    // Gestion des erreurs globales
    this.app.use(errorHandler);
  }

  private initializeWebSocket(): void {
    this.io.on('connection', (socket) => {
      console.log('Nouvelle connexion WebSocket:', socket.id);
      
      // Gestion des événements WebSocket ici
      socket.on('disconnect', () => {
        console.log('Déconnexion WebSocket:', socket.id);
      });
    });
  }

  public async listen(): Promise<void> {
    try {
      // Ensure database is connected before starting the server
      await this.initializeDatabase();
      
      this.server.listen(this.port, () => {
        console.log(`Server is running on port ${this.port}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

export default App;
