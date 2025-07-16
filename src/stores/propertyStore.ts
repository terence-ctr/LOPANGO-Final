import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Property, PropertyTypeMetadata, PropertyStatusMetadata, PropertyEquipmentMetadata, CurrencyMetadata } from '@/types/property';
import MetadataService from '@/services/metadata.service';
import PropertyService from '@/services/property.service';
import ContractService from '@/services/contract.service';
import type { PropertyStoreState, PropertyStoreGetters, PropertyStoreActions } from '@/types/stores/propertyStore';

// Clé pour le stockage local
const PROPERTY_TOKEN_KEY = 'lopango_property_token';

export const usePropertyStore = defineStore('property', () => {
  // États
  const propertyToken = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const propertyTypes = ref<any[]>([]);
  const propertyStatuses = ref<any[]>([]);
  const propertyEquipments = ref<any[]>([]);
  const currencies = ref<any[]>([]);
  const currentProperty = ref<Property | null>(null);
  const properties = ref<Property[]>([]);
  const tenantProperties = ref<Property[]>([]);

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
  const getTenantProperties = computed(() => tenantProperties.value);
  const userProperties = computed(() => properties.value);

  // Actions
  const fetchProperties = async (onlyAvailable = false) => {
    loading.value = true;
    error.value = null;
    try {
      if (onlyAvailable) {
        properties.value = await PropertyService.getAvailableProperties();
      } else {
        properties.value = await PropertyService.getProperties();
      }
    } catch (e: any) {
      error.value = e.message || 'Impossible de charger les propriétés';
      console.error('Erreur lors du chargement des propriétés:', e);
    } finally {
      loading.value = false;
    }
  };

  const fetchTenantProperties = async () => {
    loading.value = true;
    error.value = null;
    try {
      tenantProperties.value = await ContractService.getTenantProperties();
    } catch (e: any) {
      error.value = e.message || 'Impossible de charger les propriétés du locataire';
      console.error('Erreur lors du chargement des propriétés du locataire:', e);
    } finally {
      loading.value = false;
    }
  };

  const fetchPropertyById = async (id: string | number, tenantId?: string) => {
    loading.value = true;
    error.value = null;
    try {
      const property = await PropertyService.getById(id, tenantId);
      currentProperty.value = property;
      return property;
    } catch (error: any) {
      if (error.message.includes('Accès non autorisé')) {
        error.value = 'Vous n\'avez pas les droits pour accéder à cette propriété';
      } else {
        error.value = error.message || 'Impossible de charger la propriété';
      }
      console.error(`Erreur lors de la récupération de la propriété ${id}:`, error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchPropertyMetadata = async () => {
    if (loading.value) return;
    loading.value = true;
    error.value = null;
    try {
      const data = await MetadataService.getPropertyMetadata();
      propertyTypes.value = data.types || [];
      propertyStatuses.value = data.statuses || [];
      propertyEquipments.value = data.equipments || [];
      currencies.value = data.currencies || [];
      console.log('Métadonnées chargées avec succès:', {
        types: propertyTypes.value.length,
        statuses: propertyStatuses.value.length,
        equipments: propertyEquipments.value.length,
        currencies: currencies.value.length
      });
    } catch (e) {
      error.value = 'Impossible de charger les métadonnées, utilisation des valeurs par défaut';
      console.warn('Utilisation des valeurs par défaut pour les métadonnées:', e);
      propertyTypes.value = [];
      propertyStatuses.value = [];
      propertyEquipments.value = [];
      currencies.value = [];
    } finally {
      loading.value = false;
    }
  };

  const createProperty = async (propertyData: Omit<Property, 'id'>) => {
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
  };

  const updateProperty = async (id: number, propertyData: Partial<Property>) => {
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
  };

  const deleteProperty = async (id: number) => {
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
  };

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

  const updatePropertyTenant = async (propertyId: number, tenantId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const property = properties.value.find(p => p.id === propertyId);
      if (!property) {
        throw new Error('Propriété non trouvée');
      }
      const updatedProperty = await PropertyService.update(propertyId, {
        ...property,
        tenantId: tenantId
      });
      const index = properties.value.findIndex(p => p.id === propertyId);
      if (index !== -1) {
        properties.value[index] = updatedProperty;
      }
      if (currentProperty.value?.id === propertyId) {
        currentProperty.value = updatedProperty;
      }
      return updatedProperty;
    } catch (e: any) {
      error.value = e.message || 'Failed to update property tenant';
      console.error(`Error updating property tenant ${propertyId}:`, e);
      throw e;
    } finally {
      loading.value = false;
    }
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
    currentProperty,
    properties,
    tenantProperties,

    // Getters
    getPropertyToken,
    isLoading,
    propertyError,
    getProperties,
    getCurrentProperty,
    getPropertyTypes,
    getPropertyStatuses,
    getPropertyEquipments,
    getCurrencies,
    getTenantProperties,
    userProperties,

    // Actions
    fetchProperties,
    fetchTenantProperties,
    fetchPropertyById,
    fetchPropertyMetadata,
    createProperty,
    updateProperty,
    updatePropertyTenant,
    deleteProperty,
    setPropertyToken,
    setLoading,
    setError,
    clearError,
    loadStoredToken,
    clearPropertyToken
  };
});
