export enum UserType {
  ADMIN = 'admin',
  AGENT = 'agent',
  LANDLORD = 'landlord',
  TENANT = 'tenant',
  GUEST = 'guest'
}

export interface UserTokenPayload {
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
  user?: UserTokenPayload;
}
