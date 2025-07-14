import { api } from '@/config/axios';
import { apiConfig } from '@/config/api.config';

import type { PropertyType, PropertyStatus, PropertyAddress } from '@/types/property';

interface Property {
  id: string | number;
  title: string;
  type: PropertyType;
  status: PropertyStatus;
  address: PropertyAddress;
  area: number;
  rooms: number;
  bathrooms: number;
  floor?: number;
  furnished: boolean;
  equipment: string[];
  has_elevator?: boolean;
  has_parking?: boolean;
  has_balcony?: boolean;
  has_terrace?: boolean;
  has_garden?: boolean;
  has_pool?: boolean;
  has_air_conditioning?: boolean;
  has_heating?: boolean;
  rent: number;
  charges: number;
  deposit?: number;
  currency: string;
  available_from?: number;
  year_built?: number;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  images?: string[];
  isFavorite?: boolean;
}

// Interface pour les propriétés de favoris
interface PropertyFavorite {
  isFavorite: boolean;
}

class PropertyService {
  /**
   * Récupère toutes les propriétés
   */
  static async getAll() {
    try {
      const response = await api.get(`${apiConfig.baseURL}${apiConfig.endpoints.properties.base}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  /**
   * Récupère les types de propriétés
   */


  /**
   * Récupère une propriété par son ID
   * @param id - L'ID de la propriété
   */
  static async getById(id: string | number): Promise<Property> {
    try {
      const response = await api.get(`${apiConfig.baseURL}${apiConfig.endpoints.properties.byId(String(id))}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching property with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crée une nouvelle propriété
   * @param propertyData - Les données de la propriété à créer
   */
  static async create(propertyData: Partial<Property>) {
    try {
      const response = await api.post(`${apiConfig.baseURL}${apiConfig.endpoints.properties.base}`, propertyData);
      return response.data;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  /**
   * Met à jour une propriété existante
   * @param id - L'ID de la propriété à mettre à jour
   * @param propertyData - Les données mises à jour de la propriété
   */
  static async update(id: string | number, propertyData: Partial<Property> | PropertyFavorite) {
    try {
      const response = await api.put(`${apiConfig.baseURL}${apiConfig.endpoints.properties.byId(String(id))}`, propertyData);
      return response.data;
    } catch (error) {
      console.error(`Error updating property with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Supprime une propriété
   * @param id - L'ID de la propriété à supprimer
   */
  static async delete(id: string | number) {
    try {
      const response = await api.delete(`${apiConfig.baseURL}${apiConfig.endpoints.properties.byId(String(id))}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting property with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Récupère les paiements d'une propriété
   * @param propertyId - L'ID de la propriété
   */
  static async getPayments(propertyId: string | number) {
    try {
      const response = await api.get(`${apiConfig.baseURL}${apiConfig.endpoints.properties.byId(String(propertyId))}/payments`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payments for property ${propertyId}:`, error);
      throw error;
    }
  }

  /**
   * Contacte le propriétaire d'une propriété
   * @param propertyId - L'ID de la propriété
   * @param message - Le message à envoyer
   */
  static async contactOwner(propertyId: string | number, message: string) {
    try {
      const response = await api.post(`${apiConfig.baseURL}${apiConfig.endpoints.properties.byId(String(propertyId))}/contact`, {
        message
      });
      return response.data;
    } catch (error) {
      console.error(`Error contacting owner for property ${propertyId}:`, error);
      throw error;
    }
  }
}

export default PropertyService;
