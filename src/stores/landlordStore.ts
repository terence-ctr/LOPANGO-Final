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

      // Vérifier la structure de la réponse
      const responseData = response.data;
      console.log('[landlordStore] Données brutes de la réponse:', responseData);
      
      // Extraire le tableau des bailleurs de la propriété data de la réponse
      const landlordsArray = responseData.data || [];
      
      if (!Array.isArray(landlordsArray)) {
        console.error('[landlordStore] La propriété data de la réponse n\'est pas un tableau:', landlordsArray);
        throw new Error('Format de réponse API invalide: la propriété data doit être un tableau.');
      }
      
      console.log(`[landlordStore] ${landlordsArray.length} bailleur(s) reçu(s) de l'API.`);

      const landlordsData = landlordsArray.map((user: any) => {
        console.log('[landlordStore] Mapping du bailleur brut:', user);
        
        // Vérifier si l'utilisateur a les propriétés attendues
        if (!user || typeof user !== 'object') {
          console.error('[landlordStore] Données utilisateur invalides:', user);
          return null;
        }

        try {
          const mappedUser: Landlord = {
            _id: user._id?.toString() || '',
            firstName: user.firstName || user.first_name || '',
            lastName: user.lastName || user.last_name || '',
            email: user.email || '',
            nationality: user.nationality || 'Congolaise',
            identity: {
              nationalId: user.identity?.nationalId || user.identity?.national_id || '',
              documentType: user.identity?.documentType || user.identity?.document_type || 'carte_electeur'
            },
            address: {
              street: user.address?.street || '',
              city: user.address?.city || '',
              postal_code: user.address?.postal_code || '',
              country: user.address?.country || 'RDC'
            },
            userType: 'landlord' as const
          };
          
          console.log('[landlordStore] Bailleur mappé:', mappedUser);
          return mappedUser;
        } catch (error) {
          console.error('[landlordStore] Erreur lors du mapping du bailleur:', error, user);
          return null;
        }
      }).filter((user: Landlord | null): user is Landlord => user !== null);
      
      console.log('[landlordStore] Bailleurs mappés avec succès:', landlordsData);
      landlords.value = landlordsData;
      console.log('[landlordStore] Les bailleurs ont été mis à jour dans le store.', landlords.value);

    } catch (err: any) {
      console.error('[landlordStore] Une erreur est survenue lors de la récupération des bailleurs:', err);
      error.value = err.message || 'Erreur lors du chargement des bailleurs';
      
      // Ne pas utiliser de données mock en cas d'erreur
      console.warn('[landlordStore] Aucune donnée mock ne sera utilisée. Vérifiez la connexion au serveur.');
      landlords.value = [];
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