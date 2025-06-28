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
    quartier: string;
    commune: string;
  };
  userType: 'tenant';
}

export const useTenantStore = defineStore('tenant', () => {
  const tenants = ref<Tenant[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchTenants = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      // Récupérer les vrais locataires depuis l'API
      const response = await api.get('/users?user_type=tenant');
      
      // Transformer les données pour correspondre à l'interface
      const tenantsData = response.data.map((user: any) => ({
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
        userType: 'tenant' as const
      }));
      
      tenants.value = tenantsData;
      console.log('Locataires récupérés depuis la base de données:', tenantsData);
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des locataires';
      console.error('Error fetching tenants:', err);
      
      // Fallback avec des données mock en cas d'erreur
      const mockTenants: Tenant[] = [
        {
          _id: '1',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@email.com',
          nationality: 'Congolais',
          identity: {
            nationalId: '123456789',
            documentType: 'Carte d\'électeur'
          },
          address: {
            street: 'Avenue de la Paix',
            quartier: 'Gombe',
            commune: 'Gombe'
          },
          userType: 'tenant'
        }
      ];
      
      tenants.value = mockTenants;
    } finally {
      loading.value = false;
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