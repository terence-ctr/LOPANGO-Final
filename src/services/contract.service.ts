import api from './api';
import type { Contract } from '@/types/contract';

// Interface pour la propriété dans le contrat
interface ContractProperty {
  id?: string | number | null;
  title?: string;
  address?: string;
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  type?: string;
  rent?: number;
  deposit?: number;
  currency?: string;
  status?: string;
}

export default class ContractService {
  // Créer un nouveau contrat
  static async createContract(contractData: any): Promise<Contract> {
    try {
      // Créer le contrat
      const contractResponse = await api.post('/contracts', {
        ...contractData,
        propertyId: contractData.propertyId,
        agentId: contractData.agentId,
        tenantId: contractData.tenantId,
        etageData: contractData.etageData,
        propertyUpdates: contractData.propertyUpdates
      });
      
      const contract = contractResponse.data;
      
      // Si c'est une maison avec étages, créer l'enregistrement dans la table etages
      if (contractData.etageData) {
        await api.post('/etages', {
          ...contractData.etageData,
          contract_id: contract._id
        });
      }
      
      // Mettre à jour la propriété avec les nouveaux IDs
      if (contractData.propertyUpdates) {
        await api.put(`/properties/${contractData.propertyUpdates._id}`, {
          tenant_id: contractData.propertyUpdates.tenant_id,
          agent_id: contractData.propertyUpdates.agent_id
        });
      }
      
      return contract;
    } catch (error: any) {
      console.error('Erreur lors de la création du contrat:', error);
      throw error;
    }
  }

  // Récupérer les contrats du locataire connecté
  static async getTenantContracts(): Promise<Contract[]> {
    try {
      const response = await api.get('/contracts/tenant/me');
      
      // Si la réponse contient un tableau de contrats dans data
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // Si la réponse contient directement un tableau de contrats
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Si nous n'avons pas de données, retourner un tableau vide
      return [];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des contrats:', error);
      
      // Améliorer le message d'erreur
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Veuillez vous connecter pour accéder à cette ressource');
        }
        if (error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }
      
      throw new Error('Une erreur est survenue lors de la récupération des contrats');
    }
  }

  // Récupérer les propriétés associées aux contrats du locataire
  static async getTenantProperties(): Promise<any[]> {
    try {
      console.log('Début de getTenantProperties');
      const contracts = await this.getTenantContracts();
      
      console.log(`Nombre de contrats récupérés: ${contracts.length}`);
      
      // Extraire les propriétés uniques des contrats
      const properties = contracts
        .filter(contract => {
          const hasProperty = !!contract.property;
          if (!hasProperty) {
            console.warn(`Le contrat ${contract.id} n'a pas de propriété associée`);
          }
          return hasProperty;
        })
        .map(contract => {
          // Créer une copie sûre de la propriété avec des valeurs par défaut
          const property: ContractProperty = contract.property || {};
          
          // Créer un objet de propriété sûr avec des valeurs par défaut
          const safeProperty = {
            id: property.id || null,
            title: property.title || 'Titre non disponible',
            address: property.address || '',
            street: property.street || '',
            city: property.city || '',
            postal_code: property.postal_code || '',
            country: property.country || '',
            type: property.type || 'APPARTEMENT',
            rent: property.rent || 0,
            deposit: property.deposit || 0,
            currency: property.currency || 'USD',
            status: property.status || 'available',
            contractId: contract.id,
            contractStartDate: contract.start_date || contract.startDate,
            contractEndDate: contract.end_date || contract.endDate,
            contractStatus: contract.status
          };
          
          console.log(`Propriété traitée pour le contrat ${contract.id}:`, safeProperty);
          return safeProperty;
        });
      
      console.log(`Nombre de propriétés extraites: ${properties.length}`);
      return properties;
    } catch (error) {
      console.error('Erreur lors de la récupération des propriétés du locataire:', error);
      // En environnement de développement, afficher plus de détails sur l'erreur
      if (process.env.NODE_ENV === 'development' && error instanceof Error) {
        console.error('Stack trace:', error.stack);
      }
      // Renvoyer un tableau vide au lieu de propager l'erreur
      return [];
    }
  }
}
