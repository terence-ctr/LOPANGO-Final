import { UserType, Gender } from '../enums/user.enum';
import { IAddress } from './address.interface';
import { IIdentity } from './identity.interface';

export interface IUser {
  _id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: Date;
  gender: Gender;
  address: IAddress;
  userType: UserType;
  identity: IIdentity;
  emailVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  emailVerificationToken?: string;
  emailVerificationExpire?: Date;
  accountRecoveryToken?: string;
  accountRecoveryExpire?: Date;
  preferences?: IUserPreferences;
  profilePicture?: string;
  aboutMe?: string;
  socialLogins?: IUserSocialLogins;
  failedLoginAttempts: number;
  accountLockedUntil?: Date;
  mfaEnabled: boolean;
  mfaSecret?: string;
  acceptedTerms: boolean;
  acceptedTermsAt: Date;
  acceptedPrivacyPolicy: boolean;
  acceptedPrivacyPolicyAt: Date;
}

export interface IUserProfile extends Omit<IUser, 'password' | 'resetPasswordToken' | 'resetPasswordExpire' | 'emailVerificationToken' | 'emailVerificationExpire' | 'accountRecoveryToken' | 'accountRecoveryExpire' | 'mfaSecret'> {
  fullName: string;
  age?: number;
}

export interface IUserPreferences {
  language?: string;
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
}

export interface IUserSocialLogins {
  googleId?: string;
  facebookId?: string;
  appleId?: string;
}

// Interface pour la création d'utilisateur
export interface ICreateUserDto extends Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'lastLogin' | 'emailVerified' | 'isActive' | 'failedLoginAttempts' | 'mfaEnabled' | 'acceptedTerms' | 'acceptedTermsAt' | 'acceptedPrivacyPolicy' | 'acceptedPrivacyPolicyAt'> {
  confirmPassword?: string;
}

// Interface pour la mise à jour d'utilisateur
export interface IUpdateUserDto extends Partial<Omit<IUser, '_id' | 'password' | 'email' | 'createdAt' | 'updatedAt' | 'lastLogin' | 'failedLoginAttempts' | 'accountLockedUntil' | 'mfaEnabled' | 'mfaSecret' | 'acceptedTerms' | 'acceptedTermsAt' | 'acceptedPrivacyPolicy' | 'acceptedPrivacyPolicyAt'>> {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

// Interface pour la réponse de l'API utilisateur
export interface IUserResponse extends Omit<IUser, 'password' | 'resetPasswordToken' | 'resetPasswordExpire' | 'emailVerificationToken' | 'emailVerificationExpire' | 'accountRecoveryToken' | 'accountRecoveryExpire' | 'mfaSecret'> {
  // Peut inclure des champs calculés ou supplémentaires pour les réponses
  fullName: string;
  age?: number;
}
