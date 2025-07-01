import type { User } from './user.types';

/**
 * Represents a tenant in the system
 * Extends the base User type with tenant-specific properties
 */
export interface Tenant extends Omit<User, 'userType'> {
  userType: 'tenant';
  // Add any tenant-specific properties here if needed
}

/**
 * Form data for creating or updating a tenant
 */
export interface TenantFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  identity: {
    nationalId: string;
    documentType: string;
  };
  address: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  password: string;
  confirmPassword: string;
}

/**
 * Type for document types allowed for tenant identification
 */
export type IdentityDocumentType = 'carte_electeur' | 'passeport' | 'cni' | 'permis_conduire' | 'carte_sejour' | 'autre';
