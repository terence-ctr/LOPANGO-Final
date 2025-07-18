import { defineStore } from 'pinia';
import { ref, onUnmounted } from 'vue';
import { apiClient as api } from '@/services/api';
import { apiConfig } from '@/config/api.config';
import { useAuthStore } from './authStore';
import type { Contract, ContractFormData, ContractStatus } from '@/types/contract';
import type { Property } from '@/types/property';

interface ContractStore {
  contracts: Contract[]
  loading: boolean
  error: string | null
  fetchContracts: () => Promise<void>
  createContract: (contractData: ContractFormData) => Promise<Contract>
  fetchAllProperties: () => Promise<Property[]>
  updateContractStatus: (contractId: string | number, status: ContractStatus) => Promise<Contract>
  generateContractPdf: (contractId: string | number) => Promise<string>
  releasePdfUrl: (contractId: string | number) => void
}

const fixEncoding = (text: string): string => {
  return text
    .replace(/Ã©/g, 'é')
    .replace(/Ã¨/g, 'è')
    .replace(/Ãª/ig, 'ê')
    .replace(/Ã«/g, 'ë')
    .replace(/Ã®/g, 'î')
    .replace(/Ã¯/g, 'ï')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã³/ig, 'ó')
    .replace(/Ã´/g, 'ô')
    .replace(/Ã¶/g, 'ö')
    .replace(/Ã¼/ig, 'ü')
    .replace(/Ã§/g, 'ç');
};

// Normaliser le nom d'une devise
const normalizeCurrency = (currency: string): string => {
  if (!currency) return 'EUR';
  
  const normalized = currency.toLowerCase().trim();
  
  // Mappage des devises
  const currencyMap: Record<string, string> = {
    'euros': 'EUR',
    'euro': 'EUR',
    '€': 'EUR',
    'dollars': 'USD',
    'dollar': 'USD',
    'usd': 'USD',
    '$': 'USD',
    'us dollar': 'USD',
    'us dollars': 'USD',
    'dollars amÃ©ricain': 'USD',
    'dollars amÃ©ricains': 'USD'
  };
  
  // Vérifier si le code de devise est valide
  const validCurrencies = ['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD'];
  const normalizedCode = normalized.toUpperCase();
  
  if (validCurrencies.includes(normalizedCode)) {
    return normalizedCode;
  }
  
  // Utiliser la valeur mappée ou EUR par défaut
  return currencyMap[normalized] || 'EUR';
};

export const useContractStore = defineStore('contract', () => {
  // Gestionnaire d'erreurs global
  const handleError = (error: any, defaultMessage: string = 'Une erreur est survenue') => {
    console.error('Erreur dans le store:', error);
    error.value = fixEncoding(error?.response?.data?.message || error.message || defaultMessage);
    throw error;
  };
  const authStore = useAuthStore();
  const contracts = ref<Contract[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchContracts = async () => {
    loading.value = true;
    error.value = null;
    try {
      console.log('Début de la récupération des contrats...');
      
      // Récupérer les contrats en fonction du type d'utilisateur
      let endpoint = '';
      const userType = authStore.user?.userType;
      
      switch (userType) {
        case 'landlord':
          endpoint = `/contracts/landlord/me`;
          break;
        case 'agent':
          // Utiliser l'ID de l'utilisateur connecté pour récupérer les contrats de l'agent
          endpoint = `/contracts/agent/${authStore.user?.id}`;
          break;
        case 'tenant':
        default:
          endpoint = `/contracts/tenant/me`;
          break;
      }
      
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
        console.log('=== CONTRAT BRUT ===', JSON.stringify(contract, null, 2));
        console.log('Valeur de rent brute:', contract.rent, 'Type:', typeof contract.rent);
        
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
          rent: contract.rent !== undefined ? Number(contract.rent) : 0,
          deposit: Number(contract.deposit),
          currency: normalizeCurrency(contract.currency || 'EUR'),
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
          // Affichage des IDs du bailleur pour débogage
          // Utiliser les données du bailleur avec la même structure que dans landlordStore
          landlord: {
            id: String(contract.landlord_id || contract.landlordId || ''),
            firstName: contract.landlord_first_name || contract.landlord?.firstName || '',
            lastName: contract.landlord_last_name || contract.landlord?.lastName || '',
            email: contract.landlord_email || contract.landlord?.email || '',
            phone: contract.landlord_phone || contract.landlord?.phone || '',
            identity: {
              nationalId: contract.landlord?.identity?.nationalId || '',
              documentType: contract.landlord?.identity?.documentType || 'carte_electeur'
            },
            address: {
              street: contract.landlord_address_street || contract.landlord?.address?.street || '',
              city: contract.landlord_address_city || contract.landlord?.address?.city || '',
              postal_code: contract.landlord_address_postal_code || contract.landlord?.address?.postal_code || '',
              country: contract.landlord_address_country || contract.landlord?.address?.country || 'RDC'
            }
          },
          // Données du locataire
          tenant: {
            id: String(contract.tenant_id || contract.tenantId || ''),
            firstName: contract.tenant_first_name || contract.tenant?.firstName || '',
            lastName: contract.tenant_last_name || contract.tenant?.lastName || '',
            email: contract.tenant_email || contract.tenant?.email || '',
            phone: contract.tenant_phone || contract.tenant?.phone || ''
          },
          // Données de l'agent
          agent: contract.agent_id || contract.agent ? {
            id: String(contract.agent_id || contract.agent?.id || contract.agent?._id || ''),
            firstName: contract.agent_first_name || contract.agent?.firstName || contract.agent?.first_name || '',
            lastName: contract.agent_last_name || contract.agent?.lastName || contract.agent?.last_name || '',
            email: contract.agent_email || contract.agent?.email || '',
            phone: contract.agent_phone || contract.agent?.phone || ''
          } : null,
          paymentDay: contract.paymentDay || contract.payment_day,
          paymentFrequency: contract.paymentFrequency
        };
        
        console.log('=== DÉBOGAGE BAILLEUR ===');
        console.log('landlordId:', contract.landlordId);
        console.log('landlord_id:', contract.landlord_id);
        console.log('ID complet:', String(contract.landlordId || contract.landlord_id || ''));
        

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
              currency: normalizeCurrency(contract.property.currency || 'USD'),
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
              currency: normalizeCurrency(contract.property_currency || 'USD'),
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
      handleError(err, 'Erreur lors de la récupération des contrats');
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
      handleError(err, 'Erreur lors de la création du contrat');
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
      handleError(err, 'Erreur lors de la récupération des propriétés');
    } finally {
      loading.value = false;
    }
  };

  // Stockage des URLs des PDFs pour libération
  const pdfUrls = new Map<string, string>();

  // Actions pour le store
  const generateContractPdf = async (contractId: string | number): Promise<string> => {
    try {
      // Libérer l'URL précédente si elle existe
      const previousUrl = pdfUrls.get(String(contractId));
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }

      const response = await api.get(`/contracts/${contractId}/pdf`, {
        responseType: 'blob'
      });
      const blob = response.data;
      const url = URL.createObjectURL(blob);
      
      // Stocker la nouvelle URL
      pdfUrls.set(String(contractId), url);
      return url;
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      handleError(error, 'Erreur lors de la génération du PDF');
      return '';
    }
  };

  // Nettoyer les URLs lors de la destruction du store
  const cleanupPdfUrls = () => {
    pdfUrls.forEach(url => URL.revokeObjectURL(url));
    pdfUrls.clear();
  };

  // Libérer une URL de PDF spécifique
  const releasePdfUrl = (contractId: string | number) => {
    const url = pdfUrls.get(String(contractId));
    if (url) {
      URL.revokeObjectURL(url);
      pdfUrls.delete(String(contractId));
    }
  };

  // Action pour mettre à jour le statut d'un contrat
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
      handleError(err, 'Erreur lors de la mise à jour du statut du contrat');
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
    generateContractPdf,
    releasePdfUrl
  };
});
