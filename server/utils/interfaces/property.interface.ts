import { PropertyStatus, PropertyType } from '../enums/property.enum';

export interface IPropertyAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
}

export interface IPropertyFeatures {
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

export interface IPropertyFinancials {
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

export interface IPropertyStatus {
  status: PropertyStatus;
  availableFrom?: Date;
  isActive: boolean;
  lastRentedDate?: Date;
  nextAvailableDate?: Date;
  isFeatured?: boolean;
  isFurnished?: boolean;
}

export interface IPropertyImage {
  id: string;
  url: string;
  isPrimary: boolean;
  caption?: string;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPropertyDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface IProperty {
  id: string | number;
  title: string;
  description?: string;
  slug?: string;
  address: IPropertyAddress;
  features: IPropertyFeatures;
  financials: IPropertyFinancials;
  status: IPropertyStatus;
  images: IPropertyImage[];
  documents?: IPropertyDocument[];
  ownerId: string | number;
  managerId?: string | number;
  tenantId?: string | number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  tags?: string[];
  customFields?: Record<string, any>;
}
