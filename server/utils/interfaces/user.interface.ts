import { UserType, Gender, UserStatus } from '../enums/user.enum';
import { Address } from './address.interface';
import { Identity } from './identity.interface';
import { UserPreferences } from './preferences.interface';

export interface SocialLogins {
  googleId?: string;
  facebookId?: string;
  appleId?: string;
  [key: string]: string | undefined;  // Pour permettre l'ajout d'autres fournisseurs
}

export interface UserBase {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: Date;
  gender: Gender;
  userType: UserType;
  status: UserStatus;
  profilePicture?: string;
  aboutMe?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends UserBase {
  password: string;
  address: Address;
  identity: Identity;
  emailVerified: boolean;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  emailVerificationToken?: string;
  emailVerificationExpire?: Date;
  accountRecoveryToken?: string;
  accountRecoveryExpire?: Date;
  preferences?: UserPreferences;
  socialLogins?: SocialLogins;
  failedLoginAttempts: number;
  accountLockedUntil?: Date;
  mfaEnabled: boolean;
  mfaSecret?: string;
  acceptedTerms: boolean;
  acceptedTermsAt: Date;
  acceptedPrivacyPolicy: boolean;
  acceptedPrivacyPolicyAt: Date;
}

export interface SanitizedUser extends Omit<User, 
  'password' | 
  'resetPasswordToken' | 
  'resetPasswordExpire' |
  'emailVerificationToken' |
  'emailVerificationExpire' |
  'accountRecoveryToken' |
  'accountRecoveryExpire' |
  'mfaSecret' |
  'failedLoginAttempts' |
  'accountLockedUntil'
> {
  // Tous les champs sensibles sont supprimés
}

export interface UserWithRelations extends SanitizedUser {
  // Ici, vous pouvez ajouter des relations comme les propriétés, les messages, etc.
  // Par exemple:
  // properties?: Property[];
  // messages?: Message[];
}
