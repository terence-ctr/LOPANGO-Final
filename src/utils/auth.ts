import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

export const handleUnauthorized = () => {
  const authStore = useAuthStore();
  authStore.logout();
  
  const router = useRouter();
  router.push({ 
    name: 'login', 
    query: { 
      redirect: router.currentRoute.value.fullPath 
    } 
  });
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};
