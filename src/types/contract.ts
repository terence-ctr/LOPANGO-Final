export type ContractStatus = 'active' | 'pending' | 'ended' | 'cancelled' | 'draft';

// Aligned with backend property address structure
export interface Address {
  street: string;
  city?: string;
  postalCode?: string;
  country?: string;
  quartier?: string;
  commune?: string;
}

// Aligned with authStore and backend user model
export interface User {
  id: string | number;
  firstName: string;
  lastName: string;
  email?: string;
  telephone?: string;
  // Fields specific to contract context
  nationality?: string;
  idType?: IdType;
  idNumber?: string;
  address?: Address;
  birthDate?: string;
  birthPlace?: string;
}

// Aligned with backend property model
export interface Property {
  id: string | number;
  title: string;
  address: Address;
  type: 'appartement' | 'maison' | 'bureau' | 'local' | 'autre';
  rent: number;
  charges?: number;
  deposit: number;
  usage: 'residentiel' | 'commercial' | 'bureau' | 'autre';
  area: number;
  rooms: number;
  bathrooms?: number;
  floor?: number;
  description?: string;
  equipment?: string[];
  photos?: string[];
  ownerId: string | number;
  availableFrom?: string;
  createdAt: string;
  updatedAt: string;
}

// Types pour les champs du formulaire
export type IdType = 'permis_de_conduire' | 'passeport' | 'carte_sejour' | 'carte_electeur' | 'autre';
export type PropertyUsage = 'residentiel' | 'commercial' | 'bureau' | 'autre';

// A single, clean interface for the contract form data
export interface ContractFormData {
  // Landlord (Bailleur) Info
  landlordId: string;
  landlordNationality: string;
  landlordIdType: IdType;
  landlordIdNumber: string;
  landlordAddress: Address;

  // Tenant (Locataire) Info
  tenantId: string;
  tenantNationality: string;
  tenantIdType: IdType;
  tenantIdNumber: string;
  tenantAddress: Address;

  // Property Info
  propertyId: string;

  // Contract Details
  usage: PropertyUsage;
  rent: string; // Form values are often strings
  currency: string;
  deposit: string;
  duration: string; // e.g., "1 an", "3 ans"
  startDate: string;
  endDate: string;
  paymentDay?: number | null;
  status: ContractStatus;
  specialConditions?: string;
}

export interface Contract {
  id?: string | number;
  landlordId: string | number;
  tenantId: string | number;
  propertyId: string | number;
  startDate: string;
  endDate: string | null;
  rent: number;
  deposit: number;
  currency: string;
  duration: string;
  status: ContractStatus;
  specialConditions?: string;
  createdAt?: string;
  updatedAt?: string;
  // Expanded objects for easy data access in frontend
  landlord?: User;
  tenant?: User;
  property?: Property;
}

