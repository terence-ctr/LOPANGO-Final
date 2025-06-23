import api from '@/services/api';

interface Property {
  id: string | number;
  title: string;
  type: string;
  status: string;
  address: string;
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
  available_from?: string;
  year_built?: number;
  created_at?: string;
  updated_at?: string;
  description?: string;
  images?: string[];
}

class PropertyService {
  /**
   * Récupère toutes les propriétés
   */
  static async getAll() {
    try {
      const response = await api.get('/api/properties');
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  /**
   * Récupère une propriété par son ID
   * @param id - L'ID de la propriété
   */
  static async getById(id: string | number): Promise<Property> {
    try {
      const response = await api.get(`/api/properties/${id}`);
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
      const response = await api.post('/api/properties', propertyData);
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
  static async update(id: string | number, propertyData: Partial<Property>) {
    try {
      const response = await api.put(`/api/properties/${id}`, propertyData);
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
      const response = await api.delete(`/api/properties/${id}`);
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
      const response = await api.get(`/api/properties/${propertyId}/payments`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payments for property ${propertyId}:`, error);
      throw error;
    }
  }
}

export default PropertyService;
