export enum UserType {
  TENANT = 'tenant',
  LANDLORD = 'landlord',
  AGENT = 'agent',
  ADMIN = 'admin'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer-not-to-say'
}

export enum DocumentType {
  DRIVING_LICENSE = 'permis de conduire',
  PASSPORT = 'passeport',
  VOTER_CARD = 'carte d\'électeur'
}

export enum UserStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  DELETED = 'deleted'
}
