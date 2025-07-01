import axios from 'axios';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFilters {
  userId?: string;
  type?: string;
  read?: boolean;
  limit?: number;
  offset?: number;
}

export const NotificationService = {
  /**
   * Récupère les notifications d'un utilisateur
   */
  async getNotifications(filters: NotificationFilters = {}): Promise<{ data: Notification[] }> {
    try {
      const response = await axios.get('/notifications', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle notification
   */
  async createNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt' | 'updatedAt'>) {
    try {
      const response = await axios.post('/notifications', notification);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  /**
   * Marque une notification comme lue
   */
  async markAsRead(notificationId: string) {
    try {
      const response = await axios.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllAsRead(userId: string) {
    try {
      const response = await axios.patch(`/notifications/mark-all-read`, { userId });
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Supprime une notification
   */
  async deleteNotification(notificationId: string) {
    try {
      const response = await axios.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
};

export default NotificationService;
