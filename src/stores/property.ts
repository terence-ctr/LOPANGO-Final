import { defineStore } from 'pinia';
import type { Property, PropertyType, PropertyStatus, PropertyEquipmentMetadata, MetadataItem } from '@/types/property';
import PropertyService from '@/services/property.service';

// Helper types for the API responses
interface PropertyTypeResponse extends Omit<MetadataItem, 'value'> {
  value: PropertyType;
}

interface PropertyStatusResponse extends Omit<MetadataItem, 'value'> {
  value: PropertyStatus;
}

export const usePropertyStore = defineStore('property', {
  state: () => ({
    currentProperty: null as Property | null,
    propertyTypes: [] as Array<{
      id: number;
      value: PropertyType;
      label: string;
      is_active: boolean;
      display_order: number;
      created_at: number;
      updated_at: number;
    }>,
    propertyStatuses: [] as Array<{
      id: number;
      value: PropertyStatus;
      label: string;
      is_active: boolean;
      display_order: number;
      created_at: number;
      updated_at: number;
      color?: string;
    }>,
    propertyEquipments: [] as PropertyEquipmentMetadata[],
    isLoading: false,
  }),

  getters: {
    getCurrentProperty: (state) => state.currentProperty,
    getPropertyTypes: (state) => state.propertyTypes,
    getPropertyStatuses: (state) => state.propertyStatuses,
    getPropertyEquipments: (state) => state.propertyEquipments,
    isLoading: (state) => state.isLoading,
  },

  actions: {
    async fetchPropertyTypes() {
      try {
        this.isLoading = true;
        const types = await PropertyService.getPropertyTypes();
        this.propertyTypes = types.map((type, index) => ({
          id: (type as any).id || index + 1,
          value: type.value as PropertyType,
          label: type.label || type.value,
          is_active: (type as any).is_active ?? true,
          display_order: (type as any).display_order ?? index + 1,
          created_at: (type as any).created_at || Date.now(),
          updated_at: (type as any).updated_at || Date.now()
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des types de propriétés:', error);
        // Fallback to default values
        this.propertyTypes = [
          { 
            id: 1, 
            value: 'APPARTEMENT', 
            label: 'Appartement',
            is_active: true,
            display_order: 1,
            created_at: Date.now(),
            updated_at: Date.now()
          },
          { 
            id: 2,
            value: 'MAISON', 
            label: 'Maison',
            is_active: true,
            display_order: 2,
            created_at: Date.now(),
            updated_at: Date.now()
          },
          { 
            id: 3,
            value: 'VILLA', 
            label: 'Villa',
            is_active: true,
            display_order: 3,
            created_at: Date.now(),
            updated_at: Date.now()
          },
          { 
            id: 4,
            value: 'LOCAL_COMMERCIAL', 
            label: 'Local Commercial',
            is_active: true,
            display_order: 4,
            created_at: Date.now(),
            updated_at: Date.now()
          },
          { 
            id: 5,
            value: 'BUREAU', 
            label: 'Bureau',
            is_active: true,
            display_order: 5,
            created_at: Date.now(),
            updated_at: Date.now()
          },
          { 
            id: 6,
            value: 'ENTREPOT', 
            label: 'Entrepôt',
            is_active: true,
            display_order: 6,
            created_at: Date.now(),
            updated_at: Date.now()
          },
          { 
            id: 7,
            value: 'TERRAIN', 
            label: 'Terrain',
            is_active: true,
            display_order: 7,
            created_at: Date.now(),
            updated_at: Date.now()
          },
          { 
            id: 8,
            value: 'AUTRE', 
            label: 'Autre',
            is_active: true,
            display_order: 8,
            created_at: Date.now(),
            updated_at: Date.now()
          },
        ];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPropertyStatuses() {
      try {
        this.isLoading = true;
        const statuses = await PropertyService.getPropertyStatuses();
        this.propertyStatuses = statuses.map((status, index) => ({
          id: (status as any).id || index + 1,
          value: status.value as PropertyStatus,
          label: status.label,
          is_active: (status as any).is_active ?? true,
          display_order: (status as any).display_order ?? index + 1,
          created_at: (status as any).created_at || Date.now(),
          updated_at: (status as any).updated_at || Date.now(),
          color: (status as any).color || ''
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des statuts de propriétés:', error);
        // Fallback to default values
        const now = Date.now();
        this.propertyStatuses = [
          { 
            id: 1, 
            value: 'DISPONIBLE', 
            label: 'Disponible',
            is_active: true,
            display_order: 1,
            created_at: now,
            updated_at: now,
            color: '#4CAF50' // Green
          },
          { 
            id: 2,
            value: 'LOUE', 
            label: 'Loué',
            is_active: true,
            display_order: 2,
            created_at: now,
            updated_at: now,
            color: '#2196F3' // Blue
          },
          { 
            id: 3,
            value: 'EN_MAINTENANCE', 
            label: 'En maintenance',
            is_active: true,
            display_order: 3,
            created_at: now,
            updated_at: now,
            color: '#FF9800' // Orange
          },
          { 
            id: 4,
            value: 'EN_ENTRETIEN', 
            label: 'En entretien',
            is_active: true,
            display_order: 4,
            created_at: now,
            updated_at: now,
            color: '#FFC107' // Amber
          },
          { 
            id: 5,
            value: 'VENDU', 
            label: 'Vendu',
            is_active: true,
            display_order: 5,
            created_at: now,
            updated_at: now,
            color: '#9E9E9E' // Grey
          },
          { 
            id: 6,
            value: 'INDISPONIBLE', 
            label: 'Indisponible',
            is_active: true,
            display_order: 6,
            created_at: now,
            updated_at: now,
            color: '#F44336' // Red
          },
          { 
            id: 7,
            value: 'RESERVE', 
            label: 'Réservé',
            is_active: true,
            display_order: 7,
            created_at: now,
            updated_at: now,
            color: '#9C27B0' // Purple
          },
          { 
            id: 8,
            value: 'EN_NEGOCIATION', 
            label: 'En négociation',
            is_active: true,
            display_order: 8,
            created_at: now,
            updated_at: now,
            color: '#00BCD4' // Cyan
          }
        ];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPropertyEquipments() {
      try {
        this.isLoading = true;
        const equipments = await PropertyService.getPropertyEquipments();
        this.propertyEquipments = equipments.map((equipment, index) => ({
          id: (equipment as any).id || index + 1,
          value: equipment.value,
          label: equipment.label || equipment.value,
          is_active: (equipment as any).is_active ?? true,
          display_order: (equipment as any).display_order ?? index + 1,
          created_at: (equipment as any).created_at || Date.now(),
          updated_at: (equipment as any).updated_at || Date.now()
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des équipements:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async getPropertyById(id: number) {
      try {
        this.isLoading = true;
        const property = await PropertyService.getById(id);
        this.currentProperty = property;
        return property;
      } catch (error) {
        console.error('Erreur lors de la récupération de la propriété:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async createProperty(propertyData: Omit<Property, 'id'>) {
      try {
        this.isLoading = true;
        return await PropertyService.createProperty(propertyData);
      } catch (error) {
        console.error('Erreur lors de la création de la propriété:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateProperty(id: number, propertyData: Partial<Property>) {
      try {
        this.isLoading = true;
        return await PropertyService.update(id, propertyData);
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la propriété:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
