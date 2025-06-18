import { UserType } from '../../enums/user.enum';

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  userType: UserType;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  identity: {
    documentType: 'id_card' | 'passport' | 'residence_permit' | 'driver_license' | 'other';
    documentNumber: string;
    issueDate: Date;
    issuingAuthority: string;
    issuingCountry: string;
    frontDocumentUrl: string;
    backDocumentUrl?: string;
  };
  acceptTerms: boolean;
  acceptPrivacyPolicy: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponseDto {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: UserType;
    emailVerified: boolean;
    profilePicture?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface TokenPayload {
  id: string;
  type: UserType | 'refresh';
  iat?: number;
  exp?: number;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
