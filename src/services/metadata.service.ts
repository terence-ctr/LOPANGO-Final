import api from './api';

class MetadataService {
  static async getPropertyMetadata() {
    try {
      const response = await api.get('/property-metadata');
      return response.data;
    } catch (error) {
      console.error('Error fetching property metadata:', error);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        types: [],
        statuses: [],
        equipments: [],
        currencies: []
      };
    }
  }
}

export default MetadataService;
