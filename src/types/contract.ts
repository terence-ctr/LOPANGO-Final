export type ContractStatus = 'active' | 'pending' | 'ended' | 'cancelled' | 'draft';

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

import { Property as PropertyType, PropertyStatus, PropertyAddress } from './property';
import {  Address } from './user';

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
export interface Property {
  id: string | number;
  title: string;
  // Champs d'adresse détaillés
  // Adresse peut être une chaîne ou un objet PropertyAddress
  address: string | PropertyAddress;
  
  // Détails de la propriété
  type: PropertyType;
  rent: number;
  charges?: number;
  deposit: number;
  currency?: string;
  status?: PropertyStatus;
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

