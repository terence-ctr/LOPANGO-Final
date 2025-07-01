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
    city: string;
    postal_code: string;
    country: string;
  };
  userType: 'landlord';
}

export const useLandlordStore = defineStore('landlord', () => {
  const landlords = ref<Landlord[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchLandlords = async () => {
    console.log('[landlordStore] Démarrage de fetchLandlords...');
    loading.value = true;
    error.value = null;
    
    try {
      console.log('[landlordStore] Tentative de récupération des bailleurs via API: /users?user_type=landlord');
      const response = await api.get('/users?user_type=landlord');
      console.log('[landlordStore] Réponse API reçue:', response);

      if (!response.data || !Array.isArray(response.data)) {
        console.error('[landlordStore] La réponse API ne contient pas un tableau de données valide.', response.data);
        throw new Error('Format de réponse API invalide pour les bailleurs.');
      }
      
      console.log(`[landlordStore] ${response.data.length} bailleur(s) brut(s) reçu(s) de l'API.`);

      const landlordsData = response.data.map((user: any) => {
        console.log('[landlordStore] Mapping du bailleur brut:', user);
        const mappedUser = {
          _id: user.id.toString(),
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          nationality: user.nationality || 'Congolaise',
          identity: {
            nationalId: user.identity?.national_id || '',
            documentType: user.identity?.document_type || 'Carte d\'identité'
          },
          address: {
            street: user.address?.street || '',
            city: user.address?.city || '',
            postal_code: user.address?.postal_code || '',
            country: user.address?.country || ''
          },
          userType: user.user_type
        };
        console.log('[landlordStore] Bailleur mappé:', mappedUser);
        return mappedUser;
      });
      
      landlords.value = landlordsData;
      console.log('[landlordStore] Les bailleurs ont été mis à jour dans le store.', landlords.value);

    } catch (err: any) {
      console.error('[landlordStore] Une erreur est survenue lors de la récupération des bailleurs:', err);
      error.value = err.message || 'Erreur lors du chargement des bailleurs';
      
      // Fallback avec des données mock en cas d'erreur
      console.warn('[landlordStore] Utilisation des données mock en raison de l\'erreur.');
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
            city: 'Kinshasa',
            postal_code: '1000',
            country: 'RDC'
          },
          userType: 'landlord'
        }
      ];
      
      landlords.value = mockLandlords;
    } finally {
      loading.value = false;
      console.log('[landlordStore] Fin de fetchLandlords.');
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