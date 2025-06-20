import winston from 'winston';
import path from 'path';
import fs from 'fs';
import 'winston-daily-rotate-file';

// Créer le dossier de logs s'il n'existe pas
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Format des logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Format pour la console
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(
    ({ level, message, timestamp, stack }) =>
      `${timestamp} ${level}: ${message}${stack ? `\n${stack}` : ''}`
  )
);

// Configuration des transports
const transports = [
  // Fichier de log des erreurs
  new winston.transports.DailyRotateFile({
    level: 'error',
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
  }),
  
  // Fichier de log combiné
  new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
  }),
];

// En production, on ne logge pas dans la console
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Créer l'instance du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'lopango-api' },
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
    }),
  ],
  exitOnError: false, // Ne pas planter en cas d'erreur de logging
});

// Gestion des rejets de promesses non gérés
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Rejet de promesse non géré:', {
    reason,
    promise,
    stack: new Error('Stack trace').stack,
  });
});

export { logger };
