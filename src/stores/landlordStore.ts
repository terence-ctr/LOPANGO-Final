import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';

export interface Landlord {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  nationality: string;
  identity: {
    nationalId: string;
    documentType: string;
  };
  address: {
    street: string;
    quartier: string;
    commune: string;
  };
  userType: 'landlord';
}

export const useLandlordStore = defineStore('landlord', () => {
  const landlords = ref<Landlord[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchLandlords = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      // Récupérer les vrais bailleurs depuis l'API
      const response = await api.get('/users?user_type=landlord');
      
      // Transformer les données pour correspondre à l'interface
      const landlordsData = response.data.map((user: any) => ({
        _id: user.id.toString(),
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        nationality: user.nationality || 'Non spécifiée',
        identity: {
          nationalId: user.identity?.national_id || '',
          documentType: user.identity?.document_type || 'Carte d\'électeur'
        },
        address: {
          street: user.address?.street || '',
          quartier: user.address?.quartier || '',
          commune: user.address?.commune || ''
        },
        userType: 'landlord' as const
      }));
      
      landlords.value = landlordsData;
      console.log('Bailleurs récupérés depuis la base de données:', landlordsData);
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des bailleurs';
      console.error('Error fetching landlords:', err);
      
      // Fallback avec des données mock en cas d'erreur
      const mockLandlords: Landlord[] = [
        {
          _id: '1',
          firstName: 'Pierre',
          lastName: 'Dubois',
          email: 'pierre.dubois@email.com',
          nationality: 'Congolais',
          identity: {
            nationalId: '111222333',
            documentType: 'Carte d\'électeur'
          },
          address: {
            street: 'Avenue du Commerce',
            quartier: 'Ngaliema',
            commune: 'Ngaliema'
          },
          userType: 'landlord'
        }
      ];
      
      landlords.value = mockLandlords;
    } finally {
      loading.value = false;
    }
  };

  const getLandlordById = (id: string) => {
    return landlords.value.find(landlord => landlord._id === id);
  };

  return {
    landlords,
    loading,
    error,
    fetchLandlords,
    getLandlordById
  };
}); 