import { Request } from 'express';
import { UserType } from './user.types';

export interface AuthenticatedUser {
  id: number;
  email: string;
  userType: UserType;
  firstName: string;
  lastName: string;
  email_verified: boolean;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
