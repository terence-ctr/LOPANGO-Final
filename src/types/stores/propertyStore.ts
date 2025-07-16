import type { Property } from '@/types/property';

export interface PropertyStoreState {
  propertyToken: string | null;
  loading: boolean;
  error: string | null;
  propertyTypes: any[];
  propertyStatuses: any[];
  propertyEquipments: any[];
  currencies: any[];
  currentProperty: Property | null;
  properties: Property[];
  tenantProperties: Property[];
}

export interface PropertyStoreGetters {
  getPropertyToken: () => string | null;
  isLoading: () => boolean;
  propertyError: () => string | null;
  getPropertyTypes: () => any[];
  getPropertyStatuses: () => any[];
  getPropertyEquipments: () => any[];
  getCurrencies: () => any[];
  getCurrentProperty: () => Property | null;
  getProperties: () => Property[];
  getTenantProperties: () => Property[];
  userProperties: () => Property[];
}

export interface PropertyStoreActions {
  fetchProperties: (onlyAvailable?: boolean) => Promise<void>;
  fetchTenantProperties: () => Promise<void>;
  fetchPropertyById: (id: number) => Promise<void>;
  fetchPropertyMetadata: () => Promise<void>;
  createProperty: (propertyData: Omit<Property, 'id'>) => Promise<Property>;
  updateProperty: (id: number, propertyData: Partial<Property>) => Promise<Property>;
  deleteProperty: (id: number) => Promise<void>;
  setPropertyToken: (token: string | null) => void;
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  clearError: () => void;
  loadStoredToken: () => void;
  clearPropertyToken: () => void;
  updatePropertyTenant: (propertyId: number, tenantId: string) => Promise<void>;
}
