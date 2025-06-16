import { Model } from 'sequelize';
import { UserType, Gender, UserStatus } from '../utils/enums/user.enum';
import { Address } from '../utils/interfaces/address.interface';
import { Identity } from '../utils/interfaces/identity.interface';
import { UserPreferences } from '../utils/interfaces/preferences.interface';

export interface IUserBase {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: Date;
  gender: Gender;
  userType: UserType;
  status: UserStatus;
  profilePicture?: string | null;
  aboutMe?: string | null;
  lastLogin?: Date | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  refreshToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  mfaEnabled: boolean;
  mfaSecret?: string | null;
  failedLoginAttempts: number;
  accountLockedUntil?: Date | null;
  acceptedTerms: boolean;
  acceptedTermsAt: Date | null;
  acceptedPrivacyPolicy: boolean;
  acceptedPrivacyPolicyAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface IUser extends IUserBase {
  password: string;
  address?: Address | null;
  identity?: Identity | null;
  preferences?: UserPreferences | null;
}

export interface ISanitizedUser extends Omit<IUser, 'password' | 'refreshToken' | 'resetPasswordToken' | 'mfaSecret'> {}

export type UserModel = Model<IUser, IUser> & IUser;

export type UserCreationAttributes = Omit<IUser, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
