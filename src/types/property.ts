// Types de biens immobiliers
export type PropertyType = 'APPARTEMENT' | 'MAISON' | 'VILLA' | 'CHATEAU' | 'PARKING' | 'LOCAL_COMMERCIAL' | 'BUREAU' | 'ENTREPOT' | 'TERRAIN' | 'AUTRE';

// Statuts des biens immobiliers
export type PropertyStatus = 'DISPONIBLE' | 'LOUE' | 'EN_ENTRETIEN' | 'VENDU' | 'INDISPONIBLE' | 'RESERVE' | 'EN_NEGOCIATION';

export interface PropertyAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
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
  // Ajout des champs pour correspondre au schéma de validation
  parcelNumber?: string;
  name?: string;
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
  'EN_ENTRETIEN': 'En entretien',
  'VENDU': 'Vendu',
  'INDISPONIBLE': 'Indisponible',
  'RESERVE': 'Réservé',
  'EN_NEGOCIATION': 'En négociation'
};

// Pour le formulaire d'ajout/édition
export interface PropertyFormData {
  // Identifiant (pour la modification)
  id?: string | number;
  
  // Informations de base
  title: string;
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
  
  // Fichiers
  images?: File[];
  documents?: File[];
  
  // Métadonnées
  isFeatured?: boolean;
  availableFrom?: string; // Format YYYY-MM-DD
}