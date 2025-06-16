import api from './api';
import { useToast } from 'vue-toastification';

export interface CustomOptionData {
  option1: string;
  option2: string;
  text1: string;
  check1: boolean;
  check2: boolean;
}

const toast = useToast();

export const CustomOptionsService = {
  /**
   * Récupère les options personnalisées de l'utilisateur connecté
   */
  async getOptions(): Promise<CustomOptionData> {
    try {
      const response = await api.get('/api/custom-options');
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des options:', error);
      toast.error('Impossible de charger les options personnalisées');
      
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        option1: '',
        option2: '',
        text1: '',
        check1: false,
        check2: false
      };
    }
  },

  /**
   * Sauvegarde les options personnalisées de l'utilisateur
   */
  async saveOptions(data: CustomOptionData): Promise<boolean> {
    try {
      await api.post('/api/custom-options', data);
      toast.success('Options enregistrées avec succès');
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde des options:', error);
      
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue lors de la sauvegarde';
      toast.error(`Erreur: ${errorMessage}`);
      
      return false;
    }
  },

  /**
   * Réinitialise les options personnalisées de l'utilisateur
   */
  async resetOptions(): Promise<boolean> {
    try {
      await api.delete('/api/custom-options');
      toast.success('Options réinitialisées avec succès');
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la réinitialisation des options:', error);
      
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue lors de la réinitialisation';
      toast.error(`Erreur: ${errorMessage}`);
      
      return false;
    }
  }
};

export default CustomOptionsService;
