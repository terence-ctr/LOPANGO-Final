import { db } from '../database';

interface PropertyType {
  id: number;
  value: string;
  label: string;
  is_active: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

interface PropertyStatus {
  id: number;
  value: string;
  label: string;
  color: string | null;
  is_active: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

interface PropertyEquipment {
  id: number;
  value: string;
  label: string;
  is_active: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  is_active: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

export const PropertyMetadata = {
  // Types de propriétés
  async getPropertyTypes(): Promise<PropertyType[]> {
    return db('property_types')
      .where('is_active', true)
      .orderBy('display_order', 'asc');
  },

  // Statuts de propriétés
  async getPropertyStatuses(): Promise<PropertyStatus[]> {
    return db('property_statuses')
      .where('is_active', true)
      .orderBy('display_order', 'asc');
  },

  // Équipements
  async getPropertyEquipments(): Promise<PropertyEquipment[]> {
    return db('property_equipments')
      .where('is_active', true)
      .orderBy('display_order', 'asc');
  },

  // Devises
  async getCurrencies(): Promise<Currency[]> {
    return db('currencies')
      .where('is_active', true)
      .orderBy('display_order', 'asc');
  },

  // Vérifier si une valeur de type de propriété existe
  async propertyTypeExists(value: string): Promise<boolean> {
    const result = await db('property_types')
      .where('value', value)
      .first();
    return !!result;
  },

  // Vérifier si un statut de propriété existe
  async propertyStatusExists(value: string): Promise<boolean> {
    const result = await db('property_statuses')
      .where('value', value)
      .first();
    return !!result;
  },

  // Vérifier si un équipement existe
  async propertyEquipmentExists(value: string): Promise<boolean> {
    const result = await db('property_equipments')
      .where('value', value)
      .first();
    return !!result;
  },

  // Vérifier si une devise existe
  async currencyExists(code: string): Promise<boolean> {
    const result = await db('currencies')
      .where('code', code)
      .first();
    return !!result;
  }
};

export type { PropertyType, PropertyStatus, PropertyEquipment, Currency };
