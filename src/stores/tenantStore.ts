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

      if (!response.data || !Array.isArray(response.data)) {
        console.error('[tenantStore] La réponse API ne contient pas un tableau de données valide.', response.data);
        throw new Error('Format de réponse API invalide pour les locataires.');
      }
      
      console.log(`[tenantStore] ${response.data.length} locataire(s) brut(s) reçu(s) de l'API.`);

      const tenantsData = response.data.map((user: any) => {
        console.log('[tenantStore] Mapping du locataire brut:', user);
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
        console.log('[tenantStore] Locataire mappé:', mappedUser);
        return mappedUser;
      });
      
      tenants.value = tenantsData;
      console.log('[tenantStore] Les locataires ont été mis à jour dans le store.', tenants.value);

    } catch (err: any) {
      console.error('[tenantStore] Une erreur est survenue lors de la récupération des locataires:', err);
      error.value = err.message || 'Erreur lors du chargement des locataires';
      
      // Fallback avec des données mock en cas d'erreur
      console.warn('[tenantStore] Utilisation des données mock en raison de l\'erreur.');
      const mockTenants: Tenant[] = [
        {
          _id: '1',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@email.com',
          nationality: 'Français',
          identity: {
            nationalId: '123456789',
            documentType: 'Passeport'
          },
          address: {
            street: '123 Rue de la Paix',
            city: 'Kinshasa',
            postal_code: '1001',
            country: 'RDC'
          },
          userType: 'tenant'
        }
      ];
      
      tenants.value = mockTenants;
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