import { sign, verify, JwtPayload, SignOptions } from 'jsonwebtoken';
import { AuthTokens, TokenPayload } from '../types/api.types';
import config from '../config/auth.config';

const authConfig = config();

/**
 * Generate JWT token
 */
export const generateToken = (
  payload: Omit<TokenPayload, 'iat' | 'exp'>,
  options?: SignOptions
): string => {
  const secret = authConfig.jwt.secret;
  const expiresIn = options?.expiresIn || authConfig.jwt.expiresIn;
  
  return sign(
    { ...payload },
    secret,
    { 
      ...options, 
      expiresIn,
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
    }
  );
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  return sign(
    { userId },
    authConfig.jwt.refreshSecret,
    { 
      expiresIn: authConfig.jwt.refreshExpiresIn,
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
    }
  );
};

/**
 * Verify JWT token
 */
export const verifyToken = <T = JwtPayload>(
  token: string,
  isRefreshToken = false
): T => {
  const secret = isRefreshToken ? authConfig.jwt.refreshSecret : authConfig.jwt.secret;
  
  try {
    return verify(token, secret, {
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
    }) as T;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate both access and refresh tokens
 */
export const generateAuthTokens = (user: {
  id: string;
  email: string;
  userType: string;
}): AuthTokens => {
  const accessToken = generateToken({
    userId: user.id,
    email: user.email,
    userType: user.userType,
  });

  const refreshToken = generateRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    expiresIn: authConfig.jwt.expiresIn,
    tokenType: 'Bearer',
  };
};

/**
 * Extract token from Authorization header
 */
export const extractToken = (authorizationHeader: string | undefined): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const parts = authorizationHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Generate a random token for email verification, password reset, etc.
 */
export const generateRandomToken = (length = 32): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  for (let i = 0; i < length; i++) {
    token += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return token;
};

/**
 * Hash a password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = await import('bcryptjs');
  const salt = await bcrypt.genSalt(authConfig.password.saltRounds);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a password with a hash
 */
export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hashedPassword);
};
