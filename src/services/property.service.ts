import api from './api';
import type { Property } from '@/types/property';
import { useAuthStore } from '@/stores/auth';
import { apiConfig } from '@/config/api.config';

class PropertyService {
  // Créer une propriété (alias pour createProperty pour la rétrocompatibilité)
  static async create(propertyData: Omit<Property, 'id'>) {
    return this.createProperty(propertyData);
  }

  // Créer une propriété
  static async createProperty(propertyData: Omit<Property, 'id'>) {
    try {
      // Récupérer les informations de l'utilisateur connecté
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('Utilisateur non connecté');
      }
      
      const user = JSON.parse(userData);
      if (!user?.id) {
        throw new Error('ID utilisateur manquant');
      }

      // Préparer les données avec des valeurs par défaut pour les champs obligatoires
      const dataToSend: any = {
        // Informations de base
        title: propertyData.title || '',
        description: propertyData.description || '',
        type: propertyData.type || 'APPARTEMENT',
        status: propertyData.status || 'DISPONIBLE',
        
        // Adresse
        address: propertyData.address || '',
        
        // Caractéristiques
        area: Number(propertyData.area) || 0,
        rooms: Number(propertyData.rooms) || 1,
        bathrooms: Number(propertyData.bathrooms) || 1,
        floor: propertyData.floor?.toString() || '0',
        furnished: Boolean(propertyData.furnished),
        equipment: Array.isArray(propertyData.equipment) ? propertyData.equipment : [],
        
        // Équipements
        has_elevator: Boolean(propertyData.has_elevator),
        has_parking: Boolean(propertyData.has_parking),
        has_balcony: Boolean(propertyData.has_balcony),
        has_terrace: Boolean(propertyData.has_terrace),
        has_garden: Boolean(propertyData.has_garden),
        has_pool: Boolean(propertyData.has_pool),
        has_air_conditioning: Boolean(propertyData.has_air_conditioning),
        has_heating: Boolean(propertyData.has_heating),
        
        // Financier
        rent: propertyData.rent ? Number(propertyData.rent) : undefined,
        charges: propertyData.charges ? Number(propertyData.charges) : 0,
        deposit: propertyData.deposit ? Number(propertyData.deposit) : undefined,
        currency: propertyData.currency || 'EUR',
        
        // Autres
        year_built: propertyData.year_built ? Number(propertyData.year_built) : undefined,
        available_from: propertyData.available_from ? new Date(propertyData.available_from) : undefined,

        
        // Propriétaire
        owner_id: user.id
      };

      // Nettoyer les champs undefined
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === undefined) {
          delete dataToSend[key];
        }
      });

      console.log('Envoi des données au serveur:', JSON.stringify(dataToSend, null, 2));
      
      const response = await api.post('/properties', dataToSend);
      console.log('Réponse du serveur:', response.data);
      
      // Si la réponse contient directement la propriété créée
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      // Si la réponse contient directement les données de la propriété
      if (response.data && response.data.id) {
        return response.data;
      }
      
      // Si nous n'avons toujours pas de données, essayer de récupérer la propriété
      if (response.data && response.data.id) {
        const property = await this.getById(response.data.id);
        return property;
      }
      
      // Si nous n'avons toujours pas d'ID, lancer une erreur
      throw new Error('Impossible de récupérer les données de la propriété créée');
    } catch (error: any) {
      console.error('Erreur lors de la création de la propriété:', error);
      if (error.response) {
        console.error('Détails de l\'erreur:', error.response.data);
        throw new Error(error.response.data.message || 'Erreur lors de la création de la propriété');
      }
      throw error;
    }
  }

  // Récupérer toutes les propriétés (alias pour getProperties pour la rétrocompatibilité)
  static async getAll() {
    return this.getProperties();
  }

  // Récupérer les types de propriétés disponibles
  static async getPropertyTypes(): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await api.get('/property-metadata/types');
      return response.data.map((type: any) => ({
        value: type.value,
        label: type.label
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des types de propriétés:', error);
      // Valeurs par défaut en cas d'erreur
      return [
        { value: 'T1', label: 'T1' },
        { value: 'T2', label: 'T2' },
        { value: 'T3', label: 'T3' },
        { value: 'T4+', label: 'T4 et plus' },
        { value: 'MAISON', label: 'Maison' },
        { value: 'APPARTEMENT', label: 'Appartement' },
        { value: 'BUREAU', label: 'Bureau' },
        { value: 'COMMERCE', label: 'Local commercial' },
        { value: 'AUTRE', label: 'Autre' }
      ];
    }
  }

  // Récupérer les statuts de propriétés disponibles
  static async getPropertyStatuses(): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await api.get('/property-metadata/statuses');
      return response.data.map((status: any) => ({
        value: status.value,
        label: status.label
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des statuts de propriétés:', error);
      // Valeurs par défaut en cas d'erreur
      return [
        { value: 'DISPONIBLE', label: 'Disponible' },
        { value: 'LOUE', label: 'Loué' },
        { value: 'MAINTENANCE', label: 'En maintenance' },
        { value: 'INACTIF', label: 'Inactif' }
      ];
    }
  }

  // Récupérer les équipements disponibles
  static async getPropertyEquipments(): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await api.get('/property-metadata/equipments');
      return response.data.map((equipment: any) => ({
        value: equipment.value,
        label: equipment.label
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des équipements:', error);
      // Valeurs par défaut en cas d'erreur
      return [
        { value: 'FRIGO', label: 'Réfrigérateur' },
        { value: 'LINGE', label: 'Lave-linge' },
        { value: 'LAVE_VAISSELLE', label: 'Lave-vaisselle' },
        { value: 'MICRO_ONDES', label: 'Four à micro-ondes' },
        { value: 'FOUR', label: 'Four' },
        { value: 'PLAQUE_CUISSON', label: 'Plaque de cuisson' },
        { value: 'CAVE', label: 'Cave' },
        { value: 'GARAGE', label: 'Garage' },
        { value: 'PARKING', label: 'Place de parking' },
        { value: 'INTERNET', label: 'Internet' },
        { value: 'CLIMATISATION', label: 'Climatisation' },
        { value: 'CHAUFFAGE', label: 'Chauffage' },
        { value: 'MEUBLE', label: 'Meublé' },
        { value: 'ASCENSEUR', label: 'Ascenseur' },
        { value: 'DIGICODE', label: 'Digicode' },
        { value: 'INTERPHONE', label: 'Interphone' },
        { value: 'GARDIEN', label: 'Gardien' },
        { value: 'ALARME', label: 'Alarme' }
      ];
    }
  }

  // Récupérer toutes les propriétés (pour les administrateurs)
  static async getProperties(): Promise<Property[]> {
    try {
      const response = await api.get('/properties');
      
      // Si la réponse contient un tableau de propriétés dans data
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // Si la réponse contient directement un tableau de propriétés
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Si nous n'avons toujours pas de données, retourner un tableau vide
      return [];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des propriétés:', error);
      
      // Améliorer le message d'erreur
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Veuillez vous connecter pour accéder à cette ressource');
        }
        if (error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }
      
      throw new Error('Une erreur est survenue lors de la récupération des propriétés');
    }
  }

  // Récupérer les propriétés de l'utilisateur connecté
  static async getMyProperties(): Promise<Property[]> {
    try {
      const response = await api.get('/properties/my-properties');
      
      // Si la réponse contient un tableau de propriétés dans data
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // Si la réponse contient directement un tableau de propriétés
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Si nous n'avons toujours pas de données, retourner un tableau vide
      return [];
    } catch (error: any) {
      console.error('Erreur lors de la récupération de vos propriétés:', error);
      
      // Améliorer le message d'erreur
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Veuillez vous connecter pour accéder à cette ressource');
        }
        if (error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }
      
      throw new Error('Une erreur est survenue lors de la récupération de vos propriétés');
    }
  }

  // Récupérer une propriété par son ID
  static async getById(id: number): Promise<Property> {
    try {
      // Récupérer l'ID du locataire depuis le store auth
      const authStore = useAuthStore();
      const tenantId = authStore.user?._id;
      
      if (!tenantId) {
        throw new Error('ID locataire non disponible');
      }

      // Utiliser l'endpoint configuré et ajouter le tenant_id dans les en-têtes
      const response = await api.get(apiConfig.endpoints.properties.byId(id.toString()), {
        headers: {
          'X-Tenant-ID': tenantId
        }
      });
      
      console.log('[PropertyService] Réponse brute du backend:', {
        statusCode: response.status,
        headers: response.headers,
        data: response.data
      });

      // Si la réponse contient directement la propriété
      if (response.data && response.data.id) {
        console.log('[PropertyService] Format de réponse direct trouvé');
        return response.data;
      }
      
      // Si la propriété est dans un objet data
      if (response.data && response.data.data) {
        console.log('[PropertyService] Format de réponse avec data trouvé');
        return response.data.data;
      }
      
      // Si nous n'avons toujours pas de données, lancer une erreur
      console.log('[PropertyService] Format de réponse inattendu:', {
        dataStructure: response.data
      });
      throw new Error('Format de réponse inattendu du serveur');
    } catch (error: any) {
      console.error(`Erreur lors de la récupération de la propriété ${id}:`, error);
      
      // Améliorer le message d'erreur
      if (error.response) {
        if (error.response.status === 404) {
          throw new Error('Propriété non trouvée');
        }
        if (error.response.status === 403) {
          throw new Error('Vous n\'êtes pas autorisé à accéder à cette propriété');
        }
        if (error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }
      
      throw new Error(error.message || 'Une erreur est survenue lors de la récupération de la propriété');
    }
  }

  // Mettre à jour une propriété
  static async update(id: number, propertyData: Partial<Property>) {
    try {
      const response = await api.put(`/properties/${id}`, propertyData);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour de la propriété ${id}:`, error);
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }
      throw new Error('Une erreur est survenue lors de la mise à jour de la propriété');
    }
  }

  // Supprimer une propriété
  static async delete(id: number) {
    try {
      const response = await api.delete(`/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la propriété ${id}:`, error);
      throw error;
    }
  }

  // Récupérer les propriétés disponibles (sans contrat actif)
  static async getAvailableProperties() {
    try {
      const response = await api.get('/properties/available');
      
      // Si la réponse contient directement les données
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      // Si la réponse contient directement le tableau de propriétés
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Si nous n'avons toujours pas de données, lancer une erreur
      throw new Error('Format de réponse inattendu lors de la récupération des propriétés disponibles');
    } catch (error) {
      console.error('Erreur lors de la récupération des propriétés disponibles:', error);
      throw error;
    }
  }
}

export default PropertyService;
