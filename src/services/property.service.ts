import api from './api';
import type { 
  Property, 
  PropertyCreateData, 
  PropertyUpdateData, 
  PropertyFilters,
  Address,
  Equipment
} from '@/types/property';

// Types pour les réponses de l'API
interface ApiResponse<T> {
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
  };
}

interface PaginatedResponse<T> {
  rows: T[];
  count: number;
  page: number;
  totalPages: number;
}

// Types pour les réponses de l'API
interface PropertyResponse {
  data: Property;
  message?: string;
}

interface PropertiesResponse {
  data: Property[];
  total: number;
  page: number;
  limit: number;
}

const propertyService = {
  /**
   * Récupère toutes les propriétés avec pagination et filtres
   */
  async getAllProperties(
    filters: PropertyFilters = {}, 
    page = 1, 
    limit = 10
  ): Promise<PaginatedResponse<Property>> {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Property>>>('/properties', {
        params: {
          ...filters,
          page,
          limit
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des propriétés:', error);
      throw error;
    }
  },

  /**
   * Récupère une propriété par son ID
   */
  async getPropertyById(id: string): Promise<Property> {
    try {
      const response = await api.get<ApiResponse<Property>>(`/properties/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la propriété ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle propriété
   */
  async createProperty(propertyData: PropertyCreateData): Promise<Property> {
    try {
      const response = await api.post<ApiResponse<Property>>('/properties', propertyData);
      return response.data.data;
    } catch (error: any) {
      console.error('Erreur lors de la création de la propriété:', error);
      
      // Si l'erreur est une erreur d'authentification
      if (error.response?.status === 401) {
        // Ne pas relancer l'erreur ici, laisser le gestionnaire d'erreur global s'en occuper
        console.warn('Erreur d\'authentification lors de la création de la propriété');
        throw error;
      }
      
      // Gestion des erreurs de validation
      if (error.response?.data?.errors) {
        const validationErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          validationErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        throw { validationErrors, message: 'Validation error' };
      }
      
      throw new Error(error.response?.data?.message || 'Une erreur est survenue lors de la création de la propriété');
    }
  },

  /**
   * Met à jour une propriété existante
   */
  async updateProperty(id: string, propertyData: PropertyUpdateData): Promise<Property> {
    try {
      const response = await api.put<ApiResponse<Property>>(`/properties/${id}`, propertyData);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour de la propriété ${id}:`, error);
      
      // Gestion des erreurs de validation
      if (error.response?.data?.errors) {
        const validationErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          validationErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        throw { validationErrors, message: 'Validation error' };
      }
      
      throw new Error(error.response?.data?.message || `Une erreur est survenue lors de la mise à jour de la propriété ${id}`);
    }
  },

  /**
   * Supprime une propriété
   */
  async deleteProperty(id: string, hardDelete = false): Promise<void> {
    try {
      await api.delete(`/properties/${id}`, {
        params: { hard: hardDelete }
      });
    } catch (error) {
      console.error(`Erreur lors de la suppression de la propriété ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les propriétés d'un propriétaire spécifique
   */
  async getPropertiesByOwner(
    ownerId: string, 
    options: { status?: string; page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<Property>> {
    try {
      const { status, page = 1, limit = 10 } = options;
      
      const response = await api.get<ApiResponse<PaginatedResponse<Property>>>(`/properties/owner/${ownerId}`, {
        params: { status, page, limit }
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des propriétés du propriétaire ${ownerId}:`, error);
      throw error;
    }
  },
  
  /**
   * Récupère les propriétés de l'utilisateur connecté
   */
  async getMyProperties(
    options: { status?: string; page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<Property>> {
    try {
      const { status, page = 1, limit = 10 } = options;
      
      const response = await api.get<ApiResponse<PaginatedResponse<Property>>>('/properties/owner/my-properties', {
        params: { status, page, limit }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de vos propriétés:', error);
      throw error;
    }
  },
  
  /**
   * Recherche de propriétés avec des filtres avancés
   */
  async searchProperties(
    filters: PropertyFilters = {},
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Property>> {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Property>>>('/properties/search', {
        params: {
          ...filters,
          page,
          limit
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la recherche de propriétés:', error);
      throw error;
    }
  }
};

export default propertyService;
