export type PropertyType = 'T1' | 'T2' | 'T3' | 'T4+' | 'MAISON' | 'APPARTEMENT' | 'BUREAU' | 'COMMERCE' | 'AUTRE';

export type PropertyStatus = 'DISPONIBLE' | 'LOUE' | 'EN_ENTRETIEN' | 'INDISPONIBLE' | 'BROUILLON';

export interface PropertyAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyFeatures {
  type: PropertyType;
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
}

export interface PropertyFinancials {
  rent: number;
  charges: number;
  deposit: number;
  currency: string;
  pricePerSquareMeter?: number;
  priceHistory?: Array<{
    price: number;
    date: Date;
    type: 'rent' | 'sale';
  }>;
}

export interface PropertyStatusInfo {
  status: PropertyStatus;
  availableFrom?: Date;
  isActive: boolean;
  lastRentedDate?: Date;
  nextAvailableDate?: Date;
  isFeatured?: boolean;
  isFurnished?: boolean;
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
  id: string | number;
  title: string;
  description?: string;
  slug?: string;
  address: PropertyAddress;
  features: PropertyFeatures;
  financials: PropertyFinancials;
  status: PropertyStatusInfo;
  images: PropertyImage[];
  documents?: PropertyDocument[];
  ownerId: string | number;
  managerId?: string | number;
  tenantId?: string | number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  tags?: string[];
  customFields?: Record<string, any>;
}



// Libellés pour l'affichage
export const propertyTypeLabels: Record<PropertyType, string> = {
  'T1': 'T1',
  'T2': 'T2',
  'T3': 'T3',
  'T4+': 'T4+',
  'T5+': 'T5+',
  'T6+': 'T6+',
  'T7+': 'T7+',
} as const;

export const propertyStatusLabels: Record<PropertyStatus, string> = {
  'active': 'Actif',
  'inactive': 'Inactif',
  'rented': 'Loué',
  'maintenance': 'En maintenance',
  'unavailable': 'Indisponible'
} as const;

// Pour le formulaire d'ajout/édition
export interface PropertyFormData {
  // Informations de base
  title: string;
  description?: string;
  type: PropertyType;
  status: PropertyStatus;
  
  // Adresse
  street: string;
  city: string;
  postalCode: string;
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
  
  // Images et documents
  images?: File[];
  documents?: File[];
  
  // Métadonnées
  tags?: string[];
  isFeatured?: boolean;
  availableFrom?: string;
}