import { User } from './user.types';
import { Address } from './address.types';
import { DocumentType } from './identity.types';

export interface RegisterData {
  email: string;
  password: string;
  passwordConfirmation: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string | Date;
  gender: 'male' | 'female' | 'other';
  address: Omit<Address, 'additionalInfo'>;
  userType: 'tenant' | 'landlord' | 'agent' | 'admin';
  identity: {
    documentType: DocumentType;
    documentNumber: string;
    issueDate: string;
    issuingAuthority: string;
    issuingCountry: string;
    frontDocumentUrl: string;
    backDocumentUrl?: string;
  };
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: Omit<User, 'password' | 'resetPasswordToken' | 'resetPasswordExpire'>;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  passwordConfirmation: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string | Date;
  gender?: 'male' | 'female' | 'other';
  address?: Partial<Address>;
  aboutMe?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

export interface AdminUpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  userType?: 'tenant' | 'landlord' | 'agent' | 'admin';
  isActive?: boolean;
  emailVerified?: boolean;
  identityVerified?: boolean;
}

export interface AuthState {
  user: Omit<User, 'password'> | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  success: string | null;
  token: string | null;
  refreshToken: string | null;
}
