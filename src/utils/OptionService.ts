import axios from 'axios';

export class OptionService {
  static async getPropertyTypes(): Promise<{ value: string; label: string }[]> {
    try {
      const response = await axios.get('/api/options/property-types');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des types de propriétés:', error);
      return [];
    }
  }

  static async getStatusOptions(): Promise<{ value: string; label: string }[]> {
    try {
      const response = await axios.get('/api/options/status-options');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statuts:', error);
      return [];
    }
  }
}
