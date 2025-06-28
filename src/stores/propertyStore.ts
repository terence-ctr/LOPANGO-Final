import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Property, PropertyTypeMetadata, PropertyStatusMetadata, PropertyEquipmentMetadata, CurrencyMetadata } from '@/types/property';
import MetadataService from '@/services/metadata.service';
import PropertyService from '@/services/property.service';

// Clé pour le stockage local
const PROPERTY_TOKEN_KEY = 'lopango_property_token';

export const usePropertyStore = defineStore('property', () => {
  // États
  const propertyToken = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Métadonnées
  const propertyTypes = ref<PropertyTypeMetadata[]>([]);
  const propertyStatuses = ref<PropertyStatusMetadata[]>([]);
  const propertyEquipments = ref<PropertyEquipmentMetadata[]>([]);
  const currencies = ref<CurrencyMetadata[]>([]);
  const currentProperty = ref<Property | null>(null);
  const properties = ref<Property[]>([]);

  // Getters
  const getPropertyToken = computed(() => propertyToken.value);
  const isLoading = computed(() => loading.value);
  const propertyError = computed(() => error.value);
  const getPropertyTypes = computed(() => propertyTypes.value);
  const getPropertyStatuses = computed(() => propertyStatuses.value);
  const getPropertyEquipments = computed(() => propertyEquipments.value);
  const getCurrencies = computed(() => currencies.value);
  const getCurrentProperty = computed(() => currentProperty.value);
  const getProperties = computed(() => properties.value);

  async function fetchProperties() {
    loading.value = true;
    error.value = null;
    try {
      properties.value = await PropertyService.getProperties();
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch properties';
      console.error('Error fetching properties:', e);
    } finally {
      loading.value = false;
    }
  }

  async function fetchPropertyById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      currentProperty.value = await PropertyService.getById(id);
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch property';
      console.error(`Error fetching property ${id}:`, e);
    } finally {
      loading.value = false;
    }
  }

  async function fetchPropertyMetadata() {
    if (loading.value) return;
    loading.value = true;
    error.value = null;
    try {
      const data = await MetadataService.getPropertyMetadata();
      propertyTypes.value = data.types || [];
      propertyStatuses.value = data.statuses || [];
      propertyEquipments.value = data.equipments || [];
      currencies.value = data.currencies || [];
    } catch (e) {
      error.value = 'Failed to fetch property metadata';
      console.error('Error fetching metadata:', e);
    } finally {
      loading.value = false;
    }
  }

  // Actions
  async function createProperty(propertyData: Omit<Property, 'id'>) {
    loading.value = true;
    error.value = null;
    try {
      const newProperty = await PropertyService.create(propertyData);
      properties.value.push(newProperty);
      return newProperty;
    } catch (e: any) {
      error.value = e.message || 'Failed to create property';
      console.error('Error creating property:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateProperty(id: number, propertyData: Partial<Property>) {
    loading.value = true;
    error.value = null;
    try {
      const updatedProperty = await PropertyService.update(id, propertyData);
      const index = properties.value.findIndex(p => p.id === id);
      if (index !== -1) {
        properties.value[index] = { ...properties.value[index], ...updatedProperty };
      }
      if (currentProperty.value?.id === id) {
        currentProperty.value = updatedProperty;
      }
      return updatedProperty;
    } catch (e: any) {
      error.value = e.message || 'Failed to update property';
      console.error(`Error updating property ${id}:`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteProperty(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await PropertyService.delete(id);
      properties.value = properties.value.filter(p => p.id !== id);
    } catch (e: any) {
      error.value = e.message || 'Failed to delete property';
      console.error(`Error deleting property ${id}:`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  const setPropertyToken = (token: string | null) => {
    propertyToken.value = token;
    if (token) {
      localStorage.setItem(PROPERTY_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(PROPERTY_TOKEN_KEY);
    }
  };

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  const setError = (message: string | null) => {
    error.value = message;
  };

  const clearError = () => {
    error.value = null;
  };

  const loadStoredToken = () => {
    const storedToken = localStorage.getItem(PROPERTY_TOKEN_KEY);
    if (storedToken) {
      propertyToken.value = storedToken;
    }
  };

  const clearPropertyToken = () => {
    propertyToken.value = null;
    localStorage.removeItem(PROPERTY_TOKEN_KEY);
  };

  // Initialisation
  if (typeof window !== 'undefined') {
    loadStoredToken();
    fetchPropertyMetadata();
  }

  return {
    // États
    propertyToken,
    loading,
    error,
    propertyTypes,
    propertyStatuses,
    propertyEquipments,
    currencies,
    properties,

    // Getters
    getPropertyToken,
    isLoading,
    propertyError,
    getPropertyTypes,
    getPropertyStatuses,
    getPropertyEquipments,
    getCurrencies,
    getCurrentProperty,
    getProperties,

    // Actions
    setPropertyToken,
    setLoading,
    setError,
    clearError,
    loadStoredToken,
    clearPropertyToken,
    fetchPropertyMetadata,
    fetchPropertyById,
    createProperty,
    updateProperty,
    fetchProperties,
    deleteProperty
  };
});
