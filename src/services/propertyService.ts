import api from './api';
import apiConfig from '@/config/api.config';
import { PropertyFormData } from '@/types/property';

/**
 * Niveaux de log disponibles
 */
type LogLevel = 'info' | 'error' | 'debug' | 'warn';

/**
 * Formate et affiche un message de log
 */
const log = (level: LogLevel, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const context = '[PropertyService]';
  const logData = data ? JSON.stringify(data, null, 2) : '';
  
  const logMessage = `[${timestamp}] ${context} ${message}`;
  
  // En production, on ne log que les erreurs et les warnings
  if (!import.meta.env.DEV && (level === 'debug')) return;
  
  switch (level) {
    case 'error':
      console.error(`❌ ${logMessage}`, logData);
      break;
    case 'warn':
      console.warn(`⚠️ ${logMessage}`, logData);
      break;
    case 'debug':
      console.debug(`🔍 ${logMessage}`, logData);
      break;
    default:
      console.log(`ℹ️ ${logMessage}`, logData);
  }
};

/**
 * Formate les données d'une propriété pour l'API
 */
const formatPropertyForApi = (data: any): any => {
  if (!data) return {};
  
  const formatted = { ...data };
  
  // Liste des champs numériques
  const numericFields = [
    'price', 'area', 'rooms', 'bedrooms', 'bathrooms', 'floor',
    'land_area', 'rent', 'charges', 'deposit', 'year_built', 'owner_id', 'tenant_id'
  ];
  
  // Convertir les champs numériques
  numericFields.forEach(field => {
    if (formatted[field] !== undefined && formatted[field] !== '' && !isNaN(Number(formatted[field]))) {
      formatted[field] = Number(formatted[field]);
    } else if (formatted[field] === '') {
      delete formatted[field];
    }
  });
  
  // Convertir les booléens
  const booleanFields = [
    'furnished', 'has_elevator', 'has_parking', 'has_balcony',
    'has_terrace', 'has_garden', 'has_pool', 'has_air_conditioning',
    'has_heating', 'is_featured', 'is_active'
  ];
  
  booleanFields.forEach(field => {
    if (formatted[field] !== undefined) {
      formatted[field] = Boolean(formatted[field]);
    }
  });
  
  // Formater les tableaux en chaînes séparées par des virgules
  const arrayFields = ['equipment', 'tags'];
  arrayFields.forEach(field => {
    if (Array.isArray(formatted[field])) {
      formatted[field] = formatted[field].filter(Boolean).join(',');
    } else if (formatted[field] === '') {
      delete formatted[field];
    }
  });
  
  // Formater l'adresse complète si nécessaire
  if ((!formatted.full_address || formatted.full_address === '') && 
      (formatted.street || formatted.city || formatted.postal_code)) {
    formatted.full_address = [
      formatted.street,
      formatted.postal_code,
      formatted.city,
      formatted.country
    ].filter(Boolean).join(', ');
  }
  
  // Supprimer les champs vides
  Object.keys(formatted).forEach(key => {
    if (formatted[key] === '' || formatted[key] === null || formatted[key] === undefined) {
      delete formatted[key];
    }
  });
  
  return formatted;
};

/**
 * Formate les données d'une propriété reçues de l'API
 */
const formatPropertyFromApi = (data: any): any => {
  if (!data) return null;
  
  const formatted = { ...data };
  
  // Convertir les chaînes séparées par des virgules en tableaux
  const arrayFields = ['equipment', 'tags'];
  arrayFields.forEach(field => {
    if (typeof formatted[field] === 'string') {
      formatted[field] = formatted[field].split(',').filter(Boolean);
    } else if (!Array.isArray(formatted[field])) {
      formatted[field] = [];
    }
  });
  
  // Ajouter un alias pour la compatibilité avec le frontend
  if (formatted.is_featured !== undefined) {
    formatted.isFeatured = formatted.is_featured;
  }
  
  return formatted;
};

/**
 * Gestion des erreurs API
 */
const handleApiError = (error: any, context: string) => {
  const errorInfo = {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    url: error.config?.url,
    method: error.config?.method,
    responseData: error.response?.data
  };
  
  log('error', `Erreur lors de ${context}`, errorInfo);
  
  // Créer une erreur plus détaillée
  const apiError = new Error(`Erreur lors de ${context}: ${error.message}`) as any;
  apiError.status = error.response?.status;
  apiError.response = error.response?.data;
  
  throw apiError;
};

/**
 * Service pour gérer les opérations liées aux propriétés
 */
class PropertyService {
  /**
   * Crée une nouvelle propriété
   * @param propertyData Les données de la propriété à créer
   * @returns La propriété créée
   */
  static async createProperty(propertyData: PropertyFormData) {
    const requestId = `create-${Date.now()}`;
    log('debug', 'Début de la création de propriété', { requestId });
    
    try {
      // Formater les données pour l'API
      const formattedData = formatPropertyForApi(propertyData);
      log('debug', 'Données formatées pour la création', { requestId, formattedData });
      
      // Faire l'appel API
      const response = await api.post(apiConfig.endpoints.properties.base, formattedData, {
        headers: {
          'X-Request-ID': requestId,
          'Content-Type': 'application/json'
        }
      });
      
      log('info', 'Propriété créée avec succès', { 
        requestId, 
        propertyId: response.data?.id 
      });
      
      return formatPropertyFromApi(response.data);
      
    } catch (error) {
      return handleApiError(error, 'la création de la propriété');
    }
  }

  /**
   * Récupère la liste des propriétés
   * @param params Paramètres de filtrage et de pagination
   * @returns La liste des propriétés
   */
  static async getProperties(params: Record<string, any> = {}) {
    const requestId = `list-${Date.now()}`;
    log('debug', 'Récupération des propriétés', { requestId, params });
    
    try {
      const response = await api.get(apiConfig.endpoints.properties.base, {
        params,
        headers: {
          'X-Request-ID': requestId,
          'Cache-Control': 'no-cache'
        }
      });
      
      const properties = Array.isArray(response.data) 
        ? response.data.map(formatPropertyFromApi) 
        : [];
      
      log('info', 'Propriétés récupérées avec succès', { 
        requestId, 
        count: properties.length 
      });
      
      return properties;
      
    } catch (error) {
      return handleApiError(error, 'la récupération des propriétés');
    }
  }

  /**
   * Récupère une propriété par son ID
   * @param id L'ID de la propriété
   * @returns La propriété demandée
   */
  static async getPropertyById(id: string | number) {
    const requestId = `get-${id}-${Date.now()}`;
    log('debug', `Récupération de la propriété ${id}`, { requestId });
    
    try {
      const response = await api.get(`${apiConfig.endpoints.properties.base}/${id}`, {
        headers: { 'X-Request-ID': requestId }
      });
      
      log('info', `Propriété ${id} récupérée avec succès`, { requestId });
      
      return formatPropertyFromApi(response.data);
      
    } catch (error) {
      return handleApiError(error, `la récupération de la propriété ${id}`);
    }
  }

  /**
   * Met à jour une propriété existante
   * @param id L'ID de la propriété à mettre à jour
   * @param propertyData Les nouvelles données de la propriété
   * @returns La propriété mise à jour
   */
  static async updateProperty(id: string | number, propertyData: Partial<PropertyFormData>) {
    const requestId = `update-${id}-${Date.now()}`;
    log('debug', `Mise à jour de la propriété ${id}`, { requestId });
    
    try {
      // Formater les données pour l'API
      const formattedData = formatPropertyForApi(propertyData);
      log('debug', 'Données formatées pour la mise à jour', { requestId, formattedData });
      
      const response = await api.put(
        `${apiConfig.endpoints.properties.base}/${id}`, 
        formattedData,
        { headers: { 'X-Request-ID': requestId } }
      );
      
      log('info', `Propriété ${id} mise à jour avec succès`, { requestId });
      
      return formatPropertyFromApi(response.data);
      
    } catch (error) {
      return handleApiError(error, `la mise à jour de la propriété ${id}`);
    }
  }

  /**
   * Supprime une propriété
   * @param id L'ID de la propriété à supprimer
   */
  static async deleteProperty(id: string | number) {
    const requestId = `delete-${id}-${Date.now()}`;
    log('debug', `Suppression de la propriété ${id}`, { requestId });
    
    try {
      await api.delete(`${apiConfig.endpoints.properties.base}/${id}`, {
        headers: { 'X-Request-ID': requestId }
      });
      
      log('info', `Propriété ${id} supprimée avec succès`, { requestId });
      
    } catch (error) {
      return handleApiError(error, `la suppression de la propriété ${id}`);
    }
  }
  
  /**
   * Recherche des propriétés selon des critères
   * @param criteria Critères de recherche
   * @returns Les propriétés correspondant aux critères
   */
  static async searchProperties(criteria: Record<string, any> = {}) {
    const requestId = `search-${Date.now()}`;
    log('debug', 'Recherche de propriétés', { requestId, criteria });
    
    try {
      const response = await api.get(apiConfig.endpoints.properties.search, {
        params: formatPropertyForApi(criteria),
        headers: { 'X-Request-ID': requestId }
      });
      
      const properties = Array.isArray(response.data) 
        ? response.data.map(formatPropertyFromApi) 
        : [];
      
      log('info', 'Résultats de la recherche', { 
        requestId, 
        count: properties.length 
      });
      
      return properties;
      
    } catch (error) {
      return handleApiError(error, 'la recherche de propriétés');
    }
  }
}

export default PropertyService;
