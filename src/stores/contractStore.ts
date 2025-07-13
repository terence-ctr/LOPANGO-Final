import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiClient as api } from '@/services/api';
import { apiConfig } from '@/config/api.config';
import { useAuthStore } from './authStore';
import type { Contract, ContractFormData, ContractStatus } from '@/types/contract';

export const useContractStore = defineStore('contract', () => {
  const authStore = useAuthStore();
  const contracts = ref<Contract[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchContracts = async () => {
    loading.value = true;
    error.value = null;
    try {
      console.log('Début de la récupération des contrats...');
      
      // Récupérer les contrats de l'utilisateur connecté
      const endpoint = authStore.user?.userType === 'landlord' 
        ? `/contracts${apiConfig.endpoints.contracts.landlordContracts}`
        : `/contracts${apiConfig.endpoints.contracts.tenantContracts}`;
      
      console.log('Utilisation de l\'endpoint:', endpoint);
      const response = await api.get(endpoint);
      console.log('=== RÉPONSE BRUTE DE L\'API ===');
      console.log('En-têtes:', response.headers);
      console.log('Statut:', response.status, response.statusText);
      console.log('Données brutes:', JSON.stringify(response.data, null, 2));
      
      // Vérifier si la réponse contient des données valides
      if (!response.data || !Array.isArray(response.data.data)) {
        console.error('Format de réponse inattendu de l\'API:', response.data);
        throw new Error('Format de réponse inattendu de l\'API');
      }
      
      // Afficher les données brutes du premier contrat pour débogage
      if (response.data.data.length > 0) {
        console.log('=== DONNÉES BRUTES DU PREMIER CONTRAT ===');
        console.log('Champs disponibles:', Object.keys(response.data.data[0]));
        console.log('Données complètes:', JSON.stringify(response.data.data[0], null, 2));
        
        // Vérifier spécifiquement le contrat avec l'ID 14
        const contract14 = response.data.data.find((c: any) => c.id === 14);
        if (contract14) {
          console.log('=== CONTRAT ID 14 DONNÉES BRUTES ===');
          console.log('Champs disponibles:', Object.keys(contract14));
          console.log('Données complètes:', JSON.stringify(contract14, null, 2));
          console.log('Agent ID présent?:', 'agent_id' in contract14);
          console.log('Agent ID value:', contract14.agent_id);
          console.log('Agent object present?:', 'agent' in contract14);
        } else {
          console.log('Contrat avec ID 14 non trouvé dans la réponse');
        }
      }
      
      // Mapper les données de l'API vers le format attendu par le frontend
      const formattedContracts = response.data.data.map((contract: any) => {
        const result: any = {
          ...contract,
          _id: String(contract._id || contract.id),
          landlordId: String(contract.landlordId || contract.landlord_id),
          tenantId: String(contract.tenantId || contract.tenant_id),
          propertyId: String(contract.propertyId || contract.property_id),
          // Convertir agent_id en string, utiliser '' si null
          agentId: contract.agent_id ? String(contract.agent_id) : '',
          startDate: contract.startDate || contract.start_date,
          start_date: contract.start_date,
          endDate: contract.endDate || contract.end_date,
          end_date: contract.end_date,
          rent: Number(contract.rent),
          deposit: Number(contract.deposit),
          currency: contract.currency || 'EUR',
          duration: contract.duration || '',
          status: contract.status as ContractStatus,
          specialConditions: contract.specialConditions || '',
          createdAt: contract.createdAt || contract.created_at,
          updatedAt: contract.updatedAt || contract.updated_at,
          created_at: contract.created_at,
          updated_at: contract.updated_at,
          property_title: contract.property_title,
          property_address: contract.property_address,
          property_address_street: contract.property_address_street,
          property_address_city: contract.property_address_city,
          property_address_postal_code: contract.property_address_postal_code,
          property_address_country: contract.property_address_country,
          tenant_first_name: contract.tenant_first_name,
          tenant_last_name: contract.tenant_last_name,
          tenant_email: contract.tenant_email,
          tenant_phone: contract.tenant_phone,
          landlord: contract.landlord,
          tenant: contract.tenant,
          agent: contract.agent,
          paymentDay: contract.paymentDay || contract.payment_day,
          paymentFrequency: contract.paymentFrequency
        };

        // Ajouter les données de l'agent si disponibles
        if (contract.agent_id || contract.agent) {
          // Utiliser l'objet agent complet s'il est disponible
          if (contract.agent) {
            result.agent = {
              id: String(contract.agent.id || contract.agent._id || contract.agent_id || ''),
              firstName: contract.agent.firstName || contract.agent.first_name || '',
              lastName: contract.agent.lastName || contract.agent.last_name || '',
              email: contract.agent.email || ''
            };
            console.log('Agent complet trouvé dans le contrat:', result.agent);
          } else if (contract.agent_first_name || contract.agent_last_name) {
            // Utiliser les champs individuels si l'objet agent n'est pas disponible
            result.agent = {
              id: String(contract.agent_id || ''),
              firstName: contract.agent_first_name || '',
              lastName: contract.agent_last_name || '',
              email: contract.agent_email || ''
            };
            console.log('Informations agent extraites des champs individuels:', result.agent);
          }
        }

        // Ajouter les données de la propriété si disponibles
        if (contract.property_id) {
          // Utiliser l'objet property complet s'il est disponible
          if (contract.property) {
            result.property = {
              id: contract.property.id,
              title: contract.property.title || 'Propriété sans nom',
              type: contract.property.type || 'appartement',
              rent: contract.property.rent || 0,
              deposit: contract.property.deposit || 0,
              currency: contract.property.currency || 'USD',
              status: contract.property.status || 'draft',
              address: {
                street: contract.property.street || '',
                city: contract.property.city || '',
                postal_code: contract.property.postal_code || '',
                country: contract.property.country || ''
              },
              // Inclure l'agent dans la propriété si disponible
              agent: result.agent || null,
              // Alias pour la compatibilité
              street: contract.property.street || '',
              city: contract.property.city || '',
              postal_code: contract.property.postal_code || '',
              country: contract.property.country || ''
            };
          } else {
            // Utiliser les champs individuels de l'adresse
            result.property = {
              id: contract.property_id,
              title: contract.property_title || 'Propriété sans nom',
              type: contract.property_type || 'appartement',
              rent: contract.property_rent || 0,
              deposit: contract.property_deposit || 0,
              currency: contract.property_currency || 'USD',
              status: contract.property_status || 'draft',
              address: {
                street: contract.property_address_street || '',
                city: contract.property_address_city || '',
                postal_code: contract.property_address_postal_code || '',
                country: contract.property_address_country || ''
              }
            };
          }
        }

        console.log('Contrat mappé avec les ids:', result);
        // Vérifier si le contrat a tous les IDs nécessaires
        if (result.tenantId && result.landlordId && result.agentId) {
          console.log('Contrat complet trouvé:', {
            id: result.id,
            tenantId: result.tenantId,
            landlordId: result.landlordId,
            agentId: result.agentId
          });
        }

        return result;
      });
      
      console.log('Contrats mappés:', formattedContracts);
      
      // Mettre à jour la liste des contrats avec les données mappées
      contracts.value = formattedContracts;
      
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

  const createContract = async (contractData: ContractFormData) => {
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

  const fetchAllProperties = async () => {
    loading.value = true;
    error.value = null;
    try {
      console.log('Récupération de toutes les propriétés...');
      const response = await api.get('/properties');
      
      console.log('Réponse complète des propriétés:', response);
      
      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Format de réponse inattendu pour les propriétés');
      }
      
      // Mapper les propriétés au format standardisé
      const properties = response.data.data.map((prop: any) => {
        // Extraire les données de base
        const property: any = {
          id: prop.id,
          owner_id: prop.owner_id,
          title: prop.title || 'Sans titre',
          description: prop.description || '',
          type: prop.type || 'APPARTEMENT',
          area: Number(prop.area) || 0,
          rooms: Number(prop.rooms) || 0,
          bathrooms: Number(prop.bathrooms) || 0,
          floor: prop.floor || '0',
          furnished: Boolean(prop.furnished),
          has_elevator: Boolean(prop.has_elevator),
          has_parking: Boolean(prop.has_parking),
          has_balcony: Boolean(prop.has_balcony),
          has_terrace: Boolean(prop.has_terrace),
          has_garden: Boolean(prop.has_garden),
          has_pool: Boolean(prop.has_pool),
          has_air_conditioning: Boolean(prop.has_air_conditioning),
          has_heating: Boolean(prop.has_heating),
          year_built: prop.year_built ? Number(prop.year_built) : null,
          rent: Number(prop.rent) || 0,
          charges: Number(prop.charges) || 0,
          deposit: Number(prop.deposit) || 0,
          currency: prop.currency || 'EUR',
          status: prop.status || 'DISPONIBLE',
          is_active: prop.is_active !== undefined ? Boolean(prop.is_active) : true,
          is_featured: Boolean(prop.is_featured),
          available_from: prop.available_from,
          published_at: prop.published_at,
          created_at: prop.created_at || new Date().toISOString(),
          updated_at: prop.updated_at || new Date().toISOString(),
          quartier: prop.quartier || '',
          commune: prop.commune || '',
          // Gestion des équipements
          equipment: Array.isArray(prop.equipment) 
            ? prop.equipment 
            : (typeof prop.equipment === 'string' ? JSON.parse(prop.equipment || '[]') : [])
        };

        // Gestion de l'adresse
        let fullAddress = prop.address || '';
        let street = prop.street || '';
        let city = prop.city || '';
        let postal_code = prop.postal_code || prop.postalCode || '';
        let country = prop.country || 'Congo';

        // Si on a une adresse complète mais pas les champs individuels, on essaie de la parser
        if (fullAddress && !street && !city) {
          const addressParts = fullAddress.split(',').map((part: string) => part.trim());
          if (addressParts.length >= 4) {
            street = addressParts[0] || '';
            city = addressParts[2] || '';
            postal_code = addressParts[1] || '';
            country = addressParts[3] || country;
          }
        }

        // Vérifier si l'adresse est complète
        const isAddressComplete = street && (city || property.commune) && country;
        const hasOnlyCountry = !fullAddress && !street && !property.quartier && !property.commune && !city && !postal_code && country;
        const normalizedCountry = country?.toString().toLowerCase().trim();
        const isOnlyCongo = hasOnlyCountry && normalizedCountry === 'congo';

        // Définir le message d'erreur d'adresse si nécessaire
        if (isOnlyCongo) {
          property.addressError = '⚠️ Adresse incomplète - Seul le pays "Congo" est renseigné';
          console.error('Adresse incomplète: seul le pays "Congo" est renseigné pour la propriété ID:', prop.id);
        } else if (hasOnlyCountry) {
          property.addressError = `⚠️ Adresse incomplète - Seul le pays "${country}" est renseigné`;
          console.error('Adresse incomplète: seul le pays est renseigné pour la propriété ID:', prop.id, 'Pays:', country);
        } else if (!isAddressComplete) {
          property.addressError = '⚠️ Adresse incomplète - Veuillez compléter les informations manquantes';
        }

        // Construire l'adresse complète pour l'affichage
        property.address = [
          street,
          property.quartier,
          property.commune,
          city,
          postal_code,
          country
        ].filter(Boolean).join(', ');

        // Ajouter les champs d'adresse individuels
        property.street = street;
        property.city = city;
        property.postal_code = postal_code;
        property.country = country;

        return property;
      });
      
      console.log('Propriétés chargées avec succès:', properties);
      return properties;
      
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Erreur inconnue';
      error.value = `Erreur lors de la récupération des propriétés: ${errorMessage}`;
      console.error('Erreur détaillée:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateContractStatus = async (contractId: string | number, status: ContractStatus) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await api.put(`/contracts/${contractId}/status`, { status });
      
      // Mettre à jour le contrat dans le store
      const index = contracts.value.findIndex(c => c.id === contractId);
      if (index !== -1) {
        contracts.value[index].status = status;
      }
      
      return response.data;
    } catch (err: any) {
      error.value = `Erreur lors de la mise à jour du statut: ${err?.response?.data?.message || err.message || 'Erreur inconnue'}`;
      console.error('Erreur détaillée:', err);
      throw err;
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
    fetchAllProperties,
    updateContractStatus,
  };
});
