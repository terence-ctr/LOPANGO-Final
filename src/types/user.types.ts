import { Address } from './address.types';
import { Identity } from './identity.types';

export type UserType = 'tenant' | 'landlord' | 'agent' | 'admin';
export type Gender = 'male' | 'female' | 'other';

export interface User {
  _id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: Date;
  gender: Gender;
  address: Address;
  userType: UserType;
  identity: Identity;
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
  preferences?: {
    language?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
  };
  profilePicture?: string;
  aboutMe?: string;
  socialLogins?: {
    googleId?: string;
    facebookId?: string;
    appleId?: string;
  };
  failedLoginAttempts: number;
  accountLockedUntil?: Date;
  mfaEnabled: boolean;
  mfaSecret?: string;
  acceptedTerms: boolean;
  acceptedTermsAt: Date;
  acceptedPrivacyPolicy: boolean;
  acceptedPrivacyPolicyAt: Date;
}
