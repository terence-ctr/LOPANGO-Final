import { User } from './user';

export interface Address {
  street: string;
  postalCode?: string;
  city: string;
  country?: string;
  additionalInfo?: string;
  parcelNumber: string;
}

export interface Equipment {
  id: string;
  name: string;
  included: boolean;
  description?: string;
}

export interface PropertyBase {
  name: string;
  type: string;
  status: 'Disponible' | 'Loué' | 'En maintenance' | 'Hors service' | 'En attente de validation';
  description?: string;
  address: Address;
  surface: number;
  rooms: number;
  floor?: number;
  rent: number;
  charges?: number;
  deposit?: number;
  availableFrom?: string; // Date ISO
  constructionYear?: number;
  energyClass?: string;
  greenhouseGases?: string;
  equipments?: Equipment[];
  images?: string[];
  documents?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  notes?: string;
}

export interface Property extends PropertyBase {
  id: string;
  ownerId: string;
  owner?: User;
  createdAt: string; // Date ISO
  updatedAt: string; // Date ISO
  createdBy: string;
  updatedBy: string;
}

export interface PropertyCreateData extends Omit<PropertyBase, 'status' | 'equipments'> {
  status?: PropertyBase['status'];
  equipments?: string[]; // IDs des équipements
  ownerId: string;
}

export interface PropertyUpdateData extends Partial<Omit<PropertyBase, 'ownerId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>> {
  equipments?: string[]; // IDs des équipements
}

export interface PropertyFilters {
  status?: string;
  type?: string;
  minRooms?: number;
  maxRent?: number;
  minSurface?: number;
  maxSurface?: number;
  availableFrom?: string; // Date ISO
  search?: string;
  ownerId?: string;
}
