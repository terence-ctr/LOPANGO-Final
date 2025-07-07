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
  // Champs d'adresse détaillés
  address?: string; // Adresse complète formatée
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  quartier?: string;
  commune?: string;
  // Gestion des erreurs d'adresse
  addressError?: string;
  
  // Détails de la propriété
  type: 'APPARTEMENT' | 'MAISON' | 'BUREAU' | 'LOCAL' | 'AUTRE' | string;
  rent: number;
  charges?: number;
  deposit: number;
  currency?: string;
  status?: string;
  is_active?: boolean;
  
  // Caractéristiques
  area: number;
  rooms: number;
  bathrooms?: number;
  floor?: number | string;
  description?: string;
  equipment?: string[] | string; // Peut être un tableau ou une chaîne JSON
  photos?: string[];
  
  // Propriétaire
  owner_id?: string | number;
  ownerId?: string | number; // Alias pour la rétrocompatibilité
  
  // Dates
  available_from?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  
  // Autres champs potentiels
  [key: string]: any; // Pour gérer les champs supplémentaires
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
  property?: Property; // Ajout de la propriété complète
  startDate: string;
  start_date?: string; // Alias pour la compatibilité
  endDate: string | null;
  end_date?: string | null; // Alias pour la compatibilité
  rent: number;
  deposit: number;
  deposit_status?: string;
  currency: string;
  duration: string;
  status: ContractStatus;
  specialConditions?: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string; // Alias pour la compatibilité
  updated_at?: string; // Alias pour la compatibilité
  
  // Champs pour l'affichage
  property_title?: string;
  property_address?: string;
  property_address_street?: string;
  property_address_city?: string;
  property_address_postal_code?: string;
  property_address_country?: string;
  tenant_first_name?: string;
  tenant_last_name?: string;
  tenant_email?: string;
  tenant_phone?: string;
  
  // Expanded objects for easy data access in frontend
  landlord?: User;
  tenant?: User;
  paymentDay?: number | null;
  
  // Alias pour la rétrocompatibilité
  [key: string]: any;
}

