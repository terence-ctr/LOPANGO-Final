import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';

export interface Tenant {
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
  userType: 'tenant';
}

export const useTenantStore = defineStore('tenant', () => {
  const tenants = ref<Tenant[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchTenants = async () => {
    console.log('[tenantStore] Démarrage de fetchTenants...');
    loading.value = true;
    error.value = null;
    
    try {
      console.log('[tenantStore] Tentative de récupération des locataires via API: /users?user_type=tenant');
      const response = await api.get('/users?user_type=tenant');
      console.log('[tenantStore] Réponse API reçue:', response);

      // Vérifier la structure de la réponse
      const responseData = response.data;
      console.log('[tenantStore] Données brutes de la réponse:', responseData);
      
      // Extraire le tableau des locataires de la propriété data de la réponse
      const tenantsArray = responseData.data || [];
      
      if (!Array.isArray(tenantsArray)) {
        console.error('[tenantStore] La propriété data de la réponse n\'est pas un tableau:', tenantsArray);
        throw new Error('Format de réponse API invalide: la propriété data doit être un tableau.');
      }
      
      console.log(`[tenantStore] ${tenantsArray.length} locataire(s) reçu(s) de l'API.`);

      const tenantsData = tenantsArray.map((user: any) => {
        console.log('[tenantStore] Mapping du locataire brut:', user);
        
        // Vérifier si l'utilisateur a les propriétés attendues
        if (!user || typeof user !== 'object') {
          console.error('[tenantStore] Données utilisateur invalides:', user);
          return null;
        }

        try {
          const mappedUser: Tenant = {
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
            userType: 'tenant' as const
          };
          
          console.log('[tenantStore] Locataire mappé:', mappedUser);
          return mappedUser;
        } catch (error) {
          console.error('[tenantStore] Erreur lors du mapping du locataire:', error, user);
          return null;
        }
      }).filter((user): user is Tenant => user !== null);
      
      console.log('[tenantStore] Locataires après filtrage:', tenantsData);
      tenants.value = tenantsData;
      console.log('[tenantStore] Les locataires ont été mis à jour dans le store.', tenants.value);

    } catch (err: any) {
      console.error('[tenantStore] Une erreur est survenue lors de la récupération des locataires:', err);
      error.value = err.message || 'Erreur lors du chargement des locataires';
      
      // Ne pas utiliser de données mock en cas d'erreur
      console.warn('[tenantStore] Aucune donnée mock ne sera utilisée. Vérifiez la connexion au serveur.');
      tenants.value = [];
    } finally {
      loading.value = false;
      console.log('[tenantStore] Fin de fetchTenants.');
    }
  };

  const getTenantById = (id: string) => {
    return tenants.value.find(tenant => tenant._id === id);
  };

  return {
    tenants,
    loading,
    error,
    fetchTenants,
    getTenantById
  };
}); 