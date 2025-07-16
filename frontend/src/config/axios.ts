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
      await authStore.verifyAuth()
      const currentRoute = router.currentRoute.value;
      const isProtectedRoute = currentRoute.matched.some(r => r.meta.requiresAuth === true);

      if (status === 401 && isProtectedRoute && !authStore.isAuthenticated) {
        if (!authStore.skipNextUnauthorized) {
            await authStore.logout({
              status: 'error',
              message: 'Connectez-vous pour accèder à l\'application.'
            })
          } else {
            authStore.skipNextUnauthorized = false
          }
      }
      return Promise.reject(error);
    }
);

export default apiClient;
