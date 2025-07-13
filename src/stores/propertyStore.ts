import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Property, PropertyTypeMetadata, PropertyStatusMetadata, PropertyEquipmentMetadata, CurrencyMetadata } from '@/types/property';
import MetadataService from '@/services/metadata.service';
import PropertyService from '@/services/property.service';
import ContractService from '@/services/contract.service';

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
  const userProperties = computed(() => properties.value); // Alias pour la compatibilité avec le système d'alertes

  async function fetchProperties(onlyAvailable = false) {
    loading.value = true;
    error.value = null;
    try {
      if (onlyAvailable) {
        // Utiliser getAvailableProperties pour ne récupérer que les propriétés disponibles
        properties.value = await PropertyService.getAvailableProperties();
      } else {
        // Utiliser getMyProperties pour ne récupérer que les propriétés de l'utilisateur connecté
        properties.value = await PropertyService.getMyProperties();
      }
    } catch (e: any) {
      error.value = e.message || 'Impossible de charger les propriétés';
      console.error('Erreur lors du chargement des propriétés:', e);
    } finally {
      loading.value = false;
    }
  }

  // Récupérer les propriétés liées aux contrats du locataire
  async function fetchTenantProperties() {
    loading.value = true;
    error.value = null;
    try {
      // Récupérer les propriétés liées aux contrats du locataire
      tenantProperties.value = await ContractService.getTenantProperties();
    } catch (e: any) {
      error.value = e.message || 'Impossible de charger les propriétés du locataire';
      console.error('Erreur lors du chargement des propriétés du locataire:', e);
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
      console.log('Métadonnées chargées avec succès:', {
        types: propertyTypes.value.length,
        statuses: propertyStatuses.value.length,
        equipments: propertyEquipments.value.length,
        currencies: currencies.value.length
      });
    } catch (e) {
      error.value = 'Impossible de charger les métadonnées, utilisation des valeurs par défaut';
      console.warn('Utilisation des valeurs par défaut pour les métadonnées:', e);
      // Utiliser des valeurs par défaut
      propertyTypes.value = [];
      propertyStatuses.value = [];
      propertyEquipments.value = [];
      currencies.value = [];
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

  // Mettre à jour le locataire d'une propriété
  async function updatePropertyTenant(propertyId: number, tenantId: string) {
    loading.value = true;
    error.value = null;
    try {
      // Trouver la propriété à mettre à jour
      const property = properties.value.find(p => p.id === propertyId);
      if (!property) {
        throw new Error('Propriété non trouvée');
      }
      
      // Mettre à jour la propriété avec le nouvel ID de locataire
      const updatedProperty = await PropertyService.update(propertyId, {
        ...property,
        tenantId: tenantId
      });
      
      // Mettre à jour la liste des propriétés
      const index = properties.value.findIndex(p => p.id === propertyId);
      if (index !== -1) {
        properties.value[index] = updatedProperty;
      }
      
      // Mettre à jour la propriété courante si nécessaire
      if (currentProperty.value?.id === propertyId) {
        currentProperty.value = updatedProperty;
      }
      
      return updatedProperty;
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la mise à jour du locataire de la propriété';
      console.error('Erreur:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

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
    properties,
    currentProperty,
    propertyTypes,
    propertyStatuses,
    propertyEquipments,
    currencies,
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
