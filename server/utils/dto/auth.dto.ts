import { UserType } from '../enums/user.enum';

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    userType: UserType;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface TokenPayload {
  id: number;
  type: UserType | 'refresh';
  iat?: number;
  exp?: number;
}
