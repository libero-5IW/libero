import axios from 'axios';
import { API_BASE_URL } from './api';
import { useAuthStore } from '@/stores/auth';
import router from '@/routes'

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: false
})

apiClient.interceptors.request.use(
    (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {  
      const status = error.response?.status
      const authStore = useAuthStore()
      await authStore.isUserAuthenticated()
      const currentRoute = router.currentRoute.value;
      const isProtectedRoute = currentRoute.matched.some(r => r.meta.requiresAuth === true);

      if (status === 401 && isProtectedRoute && !authStore.isAuthenticated) {
        await authStore.logout();
      }
      return Promise.reject(error);
    }
);

export default apiClient;
