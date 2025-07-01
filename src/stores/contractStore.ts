import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import type { Contract } from '@/types/contract';
import type { ApiContractData } from '@/utils/contractMapper';

export const useContractStore = defineStore('contract', () => {
  const contracts = ref<Contract[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchContracts = async () => {
    loading.value = true;
    error.value = null;
    try {
      console.log('Début de la récupération des contrats...');
      
      // Récupérer les contrats du locataire connecté
      const response = await api.get('/contracts/tenant/me');
      console.log('Réponse complète de l\'API:', response);
      
      // Vérifier si la réponse contient des données valides
      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Format de réponse inattendu de l\'API');
      }
      
      // Mapper les données de l'API vers le format attendu par le frontend
      const mappedContracts = response.data.data.map((contract: any) => ({
        id: contract.id,
        landlordId: contract.landlord_id,
        tenantId: contract.tenant_id,
        propertyId: contract.property_id,
        startDate: contract.start_date,
        endDate: contract.end_date,
        rent: contract.rent,
        deposit: contract.deposit,
        currency: contract.currency || 'EUR',
        duration: contract.duration || '1 an',
        status: contract.status || 'draft',
        specialConditions: contract.special_conditions || '',
        paymentDay: contract.payment_day || null,
        // Ajouter les données du propriétaire et du bien si disponibles
        landlord: contract.landlord_id ? {
          id: contract.landlord_id,
          firstName: contract.landlord_first_name || 'Propriétaire',
          lastName: contract.landlord_last_name || 'Inconnu',
          email: contract.landlord_email || ''
        } : undefined,
        property: contract.property_id ? {
          id: contract.property_id,
          title: contract.property_title || 'Propriété sans nom',
          address: {
            street: contract.property_address_street || '',
            city: contract.property_address_city || '',
            postalCode: contract.property_address_postal_code || '',
            country: contract.property_address_country || ''
          },
          rent: contract.rent,
          deposit: contract.deposit
        } : undefined
      }));
      
      console.log('Contrats mappés:', mappedContracts);
      
      // Mettre à jour la liste des contrats avec les données mappées
      contracts.value = mappedContracts;
      
    } catch (err: any) {
      let errorMessage = 'Erreur inconnue';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      error.value = `Erreur lors de la récupération des contrats: ${errorMessage}`;
      console.error('Erreur détaillée:', err);
      
      // Vérifier si c'est une erreur d'authentification
      if (err?.response?.status === 401) {
        error.value = 'Votre session a expiré. Veuillez vous reconnecter.';
        // Rediriger vers la page de connexion
        // router.push('/login');
      }
      
      throw err; // Re-throw to be caught in the component
    } finally {
      loading.value = false;
    }
  };

  const createContract = async (contractData: ApiContractData) => {
    loading.value = true;
    error.value = null;
    try {
      // Vérifier d'abord si le serveur est accessible
      try {
        await api.get('/health');
      } catch (healthErr) {
        throw new Error('Le serveur ne répond pas. Veuillez vérifier que le serveur backend est en cours d\'exécution.');
      }
      
      // Créer le contrat avec un timeout personnalisé plus court
      const response = await api.post('/contracts', contractData, {
        timeout: 15000 // 15 secondes de timeout
      });
      
      // Ajouter le nouveau contrat à la liste
      contracts.value.push(response.data);
      return response.data;
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la création du contrat.';
      
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        errorMessage = 'Le serveur met trop de temps à répondre. Veuillez réessayer plus tard.';
      } else if (err.response) {
        // Erreur de réponse du serveur
        console.error('Erreur du serveur:', err.response.data);
        errorMessage = `Erreur du serveur: ${err.response.data?.message || 'Erreur inconnue'}`;
      } else if (err.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        console.error('Aucune réponse du serveur:', err.request);
        errorMessage = 'Impossible de joindre le serveur. Vérifiez votre connexion internet.';
      }
      
      error.value = errorMessage;
      console.error('Erreur lors de la création du contrat :', err);
      throw new Error(errorMessage); // Re-throw avec un message plus clair
    } finally {
      loading.value = false;
    }
  };

  return {
    contracts,
    loading,
    error,
    fetchContracts,
    createContract,
  };
});
