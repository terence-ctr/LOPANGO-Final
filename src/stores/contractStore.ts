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
          address: contract.property_address || {
            street: contract.property_address_street || '',
            city: contract.property_address_city || '',
            postal_code: contract.property_address_postal_code || '',
            country: contract.property_address_country || ''
          },
          street: contract.property_address_street || '',
          city: contract.property_address_city || '',
          postal_code: contract.property_address_postal_code || '',
          country: contract.property_address_country || '',
          rent: contract.rent,
          deposit: contract.deposit,
          area: contract.property_area,
          rooms: contract.property_rooms,
          bathrooms: contract.property_bathrooms,
          floor: contract.property_floor,
          type: contract.property_type
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

  return {
    contracts,
    loading,
    error,
    fetchContracts,
    createContract,
    fetchAllProperties,
  };
});
