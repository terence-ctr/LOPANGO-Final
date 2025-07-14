import api from './api';

class MetadataService {
  static async getPropertyMetadata() {
    try {
      const response = await api.get('/property-metadata');
      const data = response.data?.data || response.data;
      
      // Safely extract metadata with default values
      return {
        types: data?.types || [],
        statuses: data?.statuses || [],
        equipments: data?.equipments || [],
        currencies: data?.currencies || []
      };
    } catch (error) {
      console.error('Error fetching property metadata:', error);
      // Log detailed error information
      console.error('Error fetching property metadata:', error);
      
      // Return empty arrays instead of undefined
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
