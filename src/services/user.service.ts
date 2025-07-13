import axios from 'axios';
import { User } from '@/types/user';

export class UserService {
  static async getLandlords(): Promise<User[]> {
    try {
      const response = await axios.get('/api/users/landlords');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des bailleurs:', error);
      throw error;
    }
  }

  static async getLandlordById(id: string): Promise<User> {
    try {
      const response = await axios.get(`/api/users/landlords/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du bailleur:', error);
      throw error;
    }
  }

  static async createLandlord(landlord: Partial<User>): Promise<User> {
    try {
      const response = await axios.post('/api/users/landlords', landlord);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du bailleur:', error);
      throw error;
    }
  }

  static async updateLandlord(id: string, landlord: Partial<User>): Promise<User> {
    try {
      const response = await axios.put(`/api/users/landlords/${id}`, landlord);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du bailleur:', error);
      throw error;
    }
  }
}
