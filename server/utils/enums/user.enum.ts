export type UserType = 'tenant' | 'landlord' | 'agent' | 'admin';

export const UserTypeEnum = {
  TENANT: 'tenant' as UserType,
  LANDLORD: 'landlord' as UserType,
  AGENT: 'agent' as UserType,
  ADMIN: 'admin' as UserType
} as const;

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification'
}

export type Gender = 'male' | 'female' | 'other';

export const GenderEnum = {
  MALE: 'male' as Gender,
  FEMALE: 'female' as Gender,
  OTHER: 'other' as Gender
} as const;
