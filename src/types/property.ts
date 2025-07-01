// Types de biens immobiliers
export type PropertyType = 'APPARTEMENT' | 'MAISON' | 'VILLA' | 'CHATEAU' | 'PARKING' | 'LOCAL_COMMERCIAL' | 'BUREAU' | 'ENTREPOT' | 'TERRAIN' | 'AUTRE';

// Statuts des biens immobiliers
export type PropertyStatus = 'DISPONIBLE' | 'LOUE' | 'EN_MAINTENANCE' | 'EN_ENTRETIEN' | 'VENDU' | 'INDISPONIBLE' | 'RESERVE' | 'EN_NEGOCIATION';

// Interfaces pour les métadonnées
export interface MetadataItem {
  id: number;
  value: string;
  label: string;
  is_active: boolean;
  display_order: number;
  created_at: number;
  updated_at: number;
}

export interface PropertyTypeMetadata extends MetadataItem {
  value: PropertyType;
}

export interface PropertyStatusMetadata extends MetadataItem {
  value: PropertyStatus;
  color: string;
}

export interface PropertyEquipmentMetadata extends MetadataItem {
  value: string;
}

export interface CurrencyMetadata {
  id: number;
  code: string;
  name: string;
  symbol: string;
  is_active: boolean;
  display_order: number;
  created_at: number;
  updated_at: number;
}

export interface PropertyAddress {
  street: string;
  city: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyImage {
  id: string;
  url: string;
  isPrimary: boolean;
  caption?: string;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PropertyDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
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
  equipment?: string[];
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
  images?: PropertyImage[];
  ownerId?: string | number;
  tenantId?: string | number | null;
  customFields?: Record<string, any>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  publishedAt?: string | Date;
  tags?: string[];
}

// Libellés pour l'affichage des types de biens
export const propertyTypeLabels: Record<PropertyType, string> = {
  'APPARTEMENT': 'Appartement',
  'MAISON': 'Maison',
  'VILLA': 'Villa',
  'CHATEAU': 'Château',
  'PARKING': 'Parking',
  'LOCAL_COMMERCIAL': 'Local commercial',
  'BUREAU': 'Bureau',
  'ENTREPOT': 'Entrepôt',
  'TERRAIN': 'Terrain',
  'AUTRE': 'Autre type de bien'
};

// Libellés pour l'affichage des statuts
export const propertyStatusLabels: Record<PropertyStatus, string> = {
  'DISPONIBLE': 'Disponible',
  'LOUE': 'Loué',
  'EN_MAINTENANCE': 'En maintenance',
  'EN_ENTRETIEN': 'En entretien',
  'VENDU': 'Vendu',
  'INDISPONIBLE': 'Indisponible',
  'RESERVE': 'Réservé',
  'EN_NEGOCIATION': 'En négociation'
};

// Pour le formulaire d'ajout/édition
export interface PropertyFormData {
  // Identifiant
  id?: string | number;
  
  // Informations de base
  title: string;
  type: PropertyType;
  status: PropertyStatus;
  
  // Adresse
  street: string;
  city: string;
  postal_code: string;
  country: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  
  // Caractéristiques
  area: number;
  rooms: number;
  bathrooms: number;
  floor: string;
  furnished: boolean;
  equipment: string[];
  hasElevator?: boolean;
  hasParking?: boolean;
  hasBalcony?: boolean;
  hasTerrace?: boolean;
  hasGarden?: boolean;
  hasPool?: boolean;
  hasAirConditioning?: boolean;
  hasHeating?: boolean;
  yearBuilt?: number;
  floorArea?: number;
  landArea?: number;
  
  // Financier
  rent: number;
  charges: number;
  deposit: number;
  currency: string;
  
  // Fichiers
  images?: File[];
  documents?: File[];
  
  // Métadonnées
  description?: string;
  isFeatured?: boolean;
  availableFrom?: string; // Format YYYY-MM-DD
}