import api from './api';
import type { Contract } from '@/types/contract';

export default class ContractService {
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
      const contracts = await this.getTenantContracts();
      
      // Extraire les propriétés uniques des contrats
      const properties = contracts
        .filter(contract => contract.property)
        .map(contract => ({
          ...contract.property,
          contractId: contract.id,
          contractStartDate: contract.start_date,
          contractEndDate: contract.end_date,
          contractStatus: contract.status
        }));
      
      return properties;
    } catch (error) {
      console.error('Erreur lors de la récupération des propriétés du locataire:', error);
      throw error;
    }
  }
}
