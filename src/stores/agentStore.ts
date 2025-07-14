import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import { useAuthStore } from './authStore';

export interface Agent {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  address: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  userType: 'agent';
  isActive: boolean;
  identity: {
    nationalId: string;
    documentType: string;
  };
  // Propriétés d'alias pour la rétrocompatibilité
  first_name?: string; // Alias pour firstName
  last_name?: string; // Alias pour lastName
  user_type?: string; // Alias pour userType
  is_active?: boolean; // Alias pour isActive
  national_id?: string; // Alias pour identity.nationalId
  document_type?: string; // Alias pour identity.documentType
  created_at?: string;
  updated_at?: string;
}

export const useAgentStore = defineStore('agent', () => {
  const agents = ref<Agent[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentAgent = ref<Agent | null>(null);
  const authStore = useAuthStore();

  // Récupérer tous les agents
  // Fonction utilitaire pour gérer les réessais
  const withRetry = async <T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000
  ): Promise<T> => {
    let lastError: unknown;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const isRateLimit = (error as any)?.response?.status === 429;
        
        if (attempt === maxRetries || !isRateLimit) {
          throw error;
        }
        
        // Attendre avant de réessayer, avec un délai exponentiel
        const waitTime = delayMs * Math.pow(2, attempt - 1);
        console.warn(`Tentative ${attempt}/${maxRetries} échouée. Nouvelle tentative dans ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw lastError;
  };

  const fetchAgents = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      console.log('Début de la récupération des agents...');
      
      // Vérifier le token
      const token = authStore.getAuthToken();
      console.log('Token récupéré:', token ? '****' + token.slice(-8) : 'Aucun token');
      
      if (!token) {
        throw new Error('Aucun token d\'authentification trouvé');
      }
      
      // Vérifier l'URL de l'API
      const apiUrl = '/users/agents';
      console.log('URL de l\'API:', apiUrl);
      
      // Envoyer la requête avec gestion des réessais
      const response = await withRetry(async () => {
        console.log('Envoi de la requête GET à', apiUrl);
        try {
          return await api.get(apiUrl, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
              // Suppression de l'en-tête X-Retry-Attempt qui cause des problèmes CORS
            },
            validateStatus: (status) => status < 500,
            timeout: 10000 // 10 secondes de timeout
          });
        } catch (error) {
          console.error('Erreur lors de la requête API:', error);
          throw error; // Propage l'erreur pour la gestion des réessais
        }
      });

      console.log('Réponse reçue - Statut:', response.status);
      console.log('Données brutes de la réponse:', response.data);
      
      // Vérifier si la réponse contient des données valides
      if (!response.data) {
        console.error('Réponse vide du serveur');
        throw new Error('Aucune donnée reçue du serveur');
      }
      
      // Vérifier le format de la réponse
      let agentsData = response.data;
      
      // Si la réponse contient un tableau data, l'utiliser
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        agentsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        agentsData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        agentsData = response.data.data;
      } else {
        console.error('Format de réponse inattendu:', response.data);
        throw new Error('Format de réponse inattendu du serveur');
      }

      // Formater les données des agents avec des valeurs par défaut
      const formattedAgents = agentsData.map((agent: any) => ({
        _id: agent._id || agent.id || '',
        firstName: agent.firstName || agent.first_name || '',
        lastName: agent.lastName || agent.last_name || '',
        email: agent.email || '',
        phone: agent.phone || '',
        avatar: agent.avatar,
        userType: agent.userType || agent.user_type || 'agent',
        isActive: agent.isActive !== undefined ? agent.isActive : (agent.is_active !== undefined ? agent.is_active : true),
        address: {
          street: agent.address?.street || (agent.address || {}).street || '',
          city: agent.address?.city || (agent.address || {}).city || '',
          postal_code: agent.address?.postal_code || (agent.address || {}).postal_code || '',
          country: agent.address?.country || (agent.address || {}).country || ''
        },
        identity: {
          nationalId: (agent.identity?.nationalId || agent.identity?.national_id || ''),
          documentType: (agent.identity?.documentType || agent.identity?.document_type || 'carte_electeur')
        },
        // Champs pour la rétrocompatibilité
        id: agent._id || agent.id || '',
        first_name: agent.firstName || agent.first_name || '',
        last_name: agent.lastName || agent.last_name || '',
        user_type: agent.userType || agent.user_type || 'agent',
        is_active: agent.isActive !== undefined ? agent.isActive : (agent.is_active !== undefined ? agent.is_active : true)
      }));

      console.log('Agents formatés:', JSON.stringify(formattedAgents, null, 2));
      agents.value = formattedAgents;
      return agents.value;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des agents';
      console.error('Erreur AgentStore - fetchAgents:', errorMessage, err);
      error.value = errorMessage;
      throw errorMessage;
    } finally {
      loading.value = false;
    }
  };

  // Récupérer un agent par son ID
  const getAgentById = (id: string | number | undefined): Agent | undefined => {
    if (!id) return undefined;
    
    const idStr = String(id);
    return agents.value.find(agent => 
      agent?._id?.toString() === idStr || 
      agent?.id?.toString() === idStr ||
      (agent._id && String(agent._id) === idStr) ||
      (agent.id && String(agent.id) === idStr) ||
      (agent._id && String(agent._id).includes(idStr)) || 
      (agent.id && String(agent.id).includes(idStr))
    );
  };

  // Charger un agent spécifique par son ID avec réessai
  const fetchAgentById = async (id: string | number | undefined, skipFetch = false): Promise<Agent | null> => {
    if (!id) return null;
    
    const idStr = String(id);
    
    // Vérifier d'abord dans le store local
    const existingAgent = getAgentById(idStr);
    if (existingAgent && !skipFetch) {
      return existingAgent;
    }
    
    // Si on a déjà des agents dans le store, vérifier s'il y a une correspondance
    if (agents.value.length > 0) {
      const foundAgent = agents.value.find(agent => 
        agent?.id?.toString() === idStr || 
        agent?._id?.toString() === idStr
      );
      if (foundAgent) return foundAgent;
    }
    
    // Si non trouvé, essayer de récupérer depuis l'API
    try {
      loading.value = true;
      error.value = null;
      
      const token = authStore.getAuthToken();
      if (!token) {
        throw new Error('Non authentifié');
      }
      
      const response = await api.get('/users', {
        params: {
          user_type: 'agent',
          id: idStr
        },
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      if (response.data) {
        // La réponse est un tableau d'agents, on prend le premier élément
        const agentData = Array.isArray(response.data) ? response.data[0] : (response.data.data || response.data);
        if (!agentData) return null;
        
        // Normaliser la structure de l'agent
        const normalizedAgent: Agent = {
          _id: agentData.id || agentData._id,
          id: agentData.id || agentData._id,
          firstName: agentData.firstName || agentData.first_name || '',
          lastName: agentData.lastName || agentData.last_name || '',
          email: agentData.email || '',
          phone: agentData.phone || '',
          avatar: agentData.avatar,
          address: {
            street: agentData.address?.street || agentData.street || '',
            city: agentData.address?.city || agentData.city || '',
            postal_code: agentData.address?.postal_code || agentData.postal_code || '',
            country: agentData.address?.country || agentData.country || ''
          },
          userType: 'agent',
          isActive: agentData.isActive || agentData.is_active || false,
          identity: {
            nationalId: agentData.identity?.nationalId || agentData.identity?.national_id || '',
            documentType: agentData.identity?.documentType || agentData.identity?.document_type || ''
          },
          national_id: agentData.identity?.nationalId || agentData.identity?.national_id || '',
          document_type: agentData.identity?.documentType || agentData.identity?.document_type || '',
          first_name: agentData.firstName || agentData.first_name || '',
          last_name: agentData.lastName || agentData.last_name || '',
          user_type: 'agent',
          is_active: agentData.isActive || agentData.is_active || false,
          created_at: agentData.createdAt || agentData.created_at,
          updated_at: agentData.updatedAt || agentData.updated_at
        };

        // Mettre à jour le store avec le nouvel agent
        const existingIndex = agents.value.findIndex(a => 
          a?._id?.toString() === normalizedAgent._id || 
          a?.id?.toString() === normalizedAgent._id
        );
        
        if (existingIndex >= 0) {
          agents.value[existingIndex] = normalizedAgent;
        } else {
          agents.value.push(normalizedAgent);
        }
        
        return normalizedAgent;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur lors de la récupération de l\'agent:', errorMessage, err);
      error.value = errorMessage;
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Définir l'agent actuel
  const setCurrentAgent = (agent: Agent | null) => {
    currentAgent.value = agent;
  };

  // Récupérer l'agent actuel
  const getCurrentAgent = (): Agent | null => {
    return currentAgent.value;
  };

  // Mettre à jour un agent
  const updateAgent = async (id: string, agentData: Partial<Agent>): Promise<Agent> => {
    try {
      const token = authStore.getAuthToken();
      if (!token) throw new Error('Non authentifié');
      
      const response = await api.put(`/users/agents/${id}`, agentData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Échec de la mise à jour de l\'agent');
      }

      // Mettre à jour la liste des agents
      await fetchAgents();
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour';
      console.error('Erreur AgentStore - updateAgent:', errorMessage, err);
      throw errorMessage;
    }
  };

  return {
    // State
    agents,
    loading,
    error,
    currentAgent,
    
    // Getters
    getAgentById,
    getCurrentAgent,
    
    // Actions
    fetchAgents,
    fetchAgentById,
    setCurrentAgent,
    updateAgent
  };
});