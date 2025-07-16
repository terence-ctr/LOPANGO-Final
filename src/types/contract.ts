export type ContractStatus = 'active' | 'pending' | 'ended' | 'cancelled' | 'draft';

export type PropertyType = 'APPARTEMENT' | 'MAISON' | 'VILLA' | 'CHATEAU' | 'PARKING' | 'LOCAL_COMMERCIAL' | 'BUREAU' | 'ENTREPOT' | 'TERRAIN' | 'AUTRE';

export type PropertyStatus = 'DISPONIBLE' | 'LOUE' | 'EN_MAINTENANCE' | 'EN_ENTRETIEN' | 'VENDU' | 'INDISPONIBLE' | 'RESERVE' | 'EN_NEGOCIATION';

// Interface pour l'adresse standardisée
export interface StandardAddress {
  street: string;
  city: string;
  postal_code: string;
  country: string;
}

export interface Identity {
  nationalId: string;
  documentType: string;
}

export interface FormLandlord {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  nationality?: string;
  identity: Identity;
  address: StandardAddress;
  phone: string;
  userType?: string;
}

export interface FormTenant {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  nationality?: string;
  identity: Identity;
  address: StandardAddress;
  phone: string;
  userType?: string;
}

export interface FormAgent {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  identity: Identity;
  address: StandardAddress;
  userType?: string;
}

export interface ContractData {
  startDate: string;
  endDate: string;
  rent: number;
  charges: number;
  deposit: number;
  currency: string;
  duration: number;
  paymentDay: number | null;
  status: ContractStatus;
  specialConditions: string;
  etage?: number | string;
  hasElevator?: boolean;
  hasParking?: boolean;
  hasGarden?: boolean;
  hasBalcony?: boolean;
  hasTerrace?: boolean;
  hasPool?: boolean;
  hasAirConditioning?: boolean;
  hasHeating?: boolean;
  isFurnished?: boolean;
}

// Extension de l'interface Property pour inclure hasApartments
export interface PropertyWithApartments extends Omit<Property, 'id' | 'address' | 'type'> {
  id: string;
  _id?: string;
  address: StandardAddress;
  hasApartments: boolean;
  type: PropertyType | string;
}

import { Address } from './user';

export type User = {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  identity: Identity;
  address: StandardAddress;
  userType?: string;
}

// Aligned with backend property model
export interface PropertyAddress {
  street: string;
  city: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface Property {
  _id?: string;
  id?: string | number;
  name?: string;
  title: string;
  description?: string;
  slug?: string;
  address: string | PropertyAddress;
  type: PropertyType;
  area: number;
  rooms: number;
  bedrooms?: number;
  bathrooms: number;
  floor?: number | string;
  furnished: boolean;
  equipment?: string[] | string;
  heatingType?: string;
  energyRating?: string;
  constructionYear?: number;
  has_air_conditioning?: boolean;
  has_balcony?: boolean;
  has_elevator?: boolean;
  has_garden?: boolean;
  has_heating?: boolean;
  has_parking?: boolean;
  has_pool?: boolean;
  has_terrace?: boolean;
  year_built?: number;
  available_from?: number;
  rent: number;
  charges?: number;
  deposit?: number;
  currency?: string;
  usage?: 'residentiel' | 'commercial' | 'bureau' | 'autre';
  leaseType?: string;
  status: PropertyStatus;
  images?: Array<{ url: string; [key: string]: any }> | string[];
  photos?: string[];
  ownerId?: string | number;
  owner_id?: string | number;
  tenantId?: string | number | null;
  customFields?: Record<string, any>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  publishedAt?: string | Date;
  created_at?: string | Date;
  updated_at?: string | Date;
  published_at?: string | Date;
  is_active?: boolean;
  tags?: string[];
  [key: string]: any;
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

  // Agent Info (optionnel)
  agentId?: string | number | null;

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

