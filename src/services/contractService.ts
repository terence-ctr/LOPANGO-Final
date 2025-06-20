import axios from 'axios';
import { TOKEN_KEY } from '@/utils/auth';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Types pour les réponses API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Contract {
  id?: string | number;
  bailleurId: string | number;
  locataireId: string | number;
  proprieteId: string | number;
  dateDebut: string | Date;
  dateFin?: string | Date | null;
  loyer: number;
  garantie: number;
  devise: string;
  duree: number;
  statut: 'draft' | 'active' | 'ended' | 'cancelled';
  // Informations complémentaires
  [key: string]: any;
}

export interface User {
  id: string | number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  nationalite: string;
  typePiece: 'passeport' | '' | 'carte_sejour' | 'permis_conduire';
  numeroPiece: string;
  adresse?: {
    ville: string;
    quartier: string;
    avenue: string;
    numero: string;
  };
  // Autres champs utilisateur
}

export interface Property {
  id: string | number;
  bailleurId: string | number;
  reference: string;
  type: 'appartement' | 'maison' | 'bureau' | 'local' | 'autre';
  adresse: {
    ville: string;
    commune: string;
    quartier: string;
    avenue: string;
    numero: string;
  };
  loyer: number;
  charges: number;
  garantie: number;
  surface: number;
  nombrePieces: number;
  etage?: number;
  description?: string;
  statut: 'disponible' | 'loue' | 'en_entretien' | 'indisponible';
  // Autres champs de propriété
}

export const contractService = {
  // Récupérer tous les contrats
  async getAll(): Promise<Contract[]> {
    try {
      const response = await axios.get<ApiResponse<Contract[]>>(`${API_URL}/contrats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des contrats:', error);
      throw error;
    }
  },

  // Récupérer un contrat par son ID
  async getById(id: string | number): Promise<Contract> {
    try {
      const response = await axios.get<ApiResponse<Contract>>(`${API_URL}/contrats/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du contrat ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouveau contrat
  async create(contract: Omit<Contract, 'id'>): Promise<Contract> {
    try {
      const response = await axios.post<ApiResponse<Contract>>(
        `${API_URL}/contrats`,
        contract,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la création du contrat:', error);
      throw error;
    }
  },

  // Mettre à jour un contrat existant
  async update(id: string | number, contract: Partial<Contract>): Promise<Contract> {
    try {
      const response = await axios.put<ApiResponse<Contract>>(
        `${API_URL}/contrats/${id}`,
        contract,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du contrat ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un contrat
  async delete(id: string | number): Promise<void> {
    try {
      await axios.delete<ApiResponse<void>>(`${API_URL}/contrats/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
        }
      });
    } catch (error) {
      console.error(`Erreur lors de la suppression du contrat ${id}:`, error);
      throw error;
    }
  },

  // Récupérer tous les bailleurs depuis l'API
  async getBailleurs(): Promise<User[]> {
    try {
      const response = await axios.get<ApiResponse<User[]>>(`${API_URL}/users/bailleurs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erreur lors de la récupération des bailleurs');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des bailleurs:', error);
      throw error; // Propager l'erreur pour une gestion plus précise dans les composants
    }
  },

  // Récupérer tous les locataires depuis l'API
  async getLocataires(): Promise<User[]> {
    try {
      const response = await axios.get<ApiResponse<User[]>>(`${API_URL}/users/locataires`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erreur lors de la récupération des locataires');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des locataires:', error);
      throw error; // Propager l'erreur pour une gestion plus précise dans les composants
    }
  },

  // Récupérer les propriétés d'un bailleur depuis l'API
  async getPropertiesByLandlord(landlordId: string | number): Promise<Property[]> {
    try {
      if (!landlordId) {
        console.warn('Aucun ID de bailleur fourni pour la récupération des propriétés');
        return [];
      }

      const response = await axios.get<ApiResponse<Property[]>>(
        `${API_URL}/proprietes/bailleur/${landlordId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        console.error('Erreur lors de la récupération des propriétés:', response.data.message);
        return [];
      }

      return response.data.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des propriétés du bailleur:', error);
      return [];
    }
  },

  // Récupérer les détails d'une propriété
  async getPropertyDetails(propertyId: string | number): Promise<Property> {
    try {
      const response = await axios.get<ApiResponse<Property>>(
        `${API_URL}/proprietes/${propertyId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la propriété:', error);
      throw error;
    }
  },
  
  // Récupérer les contrats d'un utilisateur
  async getUserContracts(userId: string | number, userType: 'bailleur' | 'locataire'): Promise<Contract[]> {
    try {
      const response = await axios.get<ApiResponse<Contract[]>>(
        `${API_URL}/contrats/utilisateur/${userId}?type=${userType}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
          }
        }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des contrats:', error);
      throw error;
    }
  },
  
  // Créer un nouveau contrat (alias pour compatibilité)
  async createContract(contractData: Omit<Contract, 'id'>): Promise<Contract> {
    return this.create(contractData);
  }
};
