import api from './api';

class MetadataService {
  static async getPropertyMetadata() {
    try {
      const response = await api.get('/properties/metadata');
      return response.data;
    } catch (error) {
      console.error('Error fetching property metadata:', error);
      throw error;
    }
  }
}

export default MetadataService;
