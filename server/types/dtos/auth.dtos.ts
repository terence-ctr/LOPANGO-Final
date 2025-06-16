import { UserType, Gender } from '../enums/user.enum';
import { AddressInput } from '../interfaces/address.interface';
import { IdentityInput } from '../interfaces/identity.interface';
import { SanitizedUser } from '../interfaces/user.interface';

export interface LoginCredentialsDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterUserDTO {
  email: string;
  password: string;
  passwordConfirmation: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string | Date;
  gender: Gender;
  address: AddressInput;
  userType: UserType;
  identity: IdentityInput;
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
}

export interface AuthResponseDTO {
  user: SanitizedUser;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  password: string;
  passwordConfirmation: string;
}

export interface VerifyEmailDTO {
  token: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string | Date;
  gender?: Gender;
  aboutMe?: string;
  address?: Partial<AddressInput>;
}

export interface RequestEmailVerificationDTO {
  email: string;
}

export interface VerifyMfaDTO {
  code: string;
  token?: string;  // Pour la vérification initiale
}

export interface EnableMfaResponseDTO {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}
