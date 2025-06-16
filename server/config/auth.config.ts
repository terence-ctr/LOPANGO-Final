import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m', // 15 minutes
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // 7 days
    issuer: process.env.JWT_ISSUER || 'lopango-api',
    audience: process.env.JWT_AUDIENCE || 'lopango-client',
  },

  // Password configuration
  password: {
    minLength: 8,
    maxLength: 100,
    saltRounds: 10,
    requireSpecialChar: true,
    requireNumber: true,
    requireUppercase: true,
    requireLowercase: true,
  },

  // Account lockout configuration
  accountLockout: {
    maxFailedAttempts: 5,
    lockoutTime: 15 * 60 * 1000, // 15 minutes in milliseconds
  },

  // Email verification
  emailVerification: {
    expiresIn: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  },

  // Password reset
  passwordReset: {
    expiresIn: 1 * 60 * 60 * 1000, // 1 hour in milliseconds
  },

  // Rate limiting
  rateLimit: {
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 requests per windowMs
    },
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
  },
}));
