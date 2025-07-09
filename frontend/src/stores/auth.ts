import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/config/axios';
import { cleanAllStates } from '@/composables/useStateCleaner';
import { type ApiCurrentUser, ApiCurrentUserSchema, type LoginData, type RegisterData } from '@/schemas/user.schema';
import { handleError } from '@/utils/handleError';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();

  const user = ref<ApiCurrentUser | null>(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);
  const errorMessage = ref('');
  const authAlreadyChecked = ref(false);


  const clearState = () => {
    loading.value = false;
    errorMessage.value = '';
    isAuthenticated.value = false;
    user.value = null;
  };

  const login = async (data: LoginData) => {
    clearState();
    loading.value = true;
    try {
      const response = await apiClient.post('/auth/login', data);
      const token = response.data.token;
      localStorage.setItem('token', token);

      const me = await apiClient.get('/auth/me');
      user.value = ApiCurrentUserSchema.parse(me.data);

      isAuthenticated.value = true;
      router.push('/dashboard');

    } catch (error) {
      handleError(error, 'Erreur lors de la connexion.')
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    cleanAllStates();
    localStorage.removeItem('token');
    await router.push({name: 'Login'})
  };

  const register = async (data: RegisterData) => {
    clearState();
    loading.value = true;
    try {
      await apiClient.post('/auth/register', data);
    } catch (error) {
      handleError(error, 'Erreur lors de l’inscription.')
    } finally {
      loading.value = false;
    }
  };

  const verifyAuth = async () => {
    loading.value = true;
    if (authAlreadyChecked.value) return;
    authAlreadyChecked.value = true;
    try {
      const response = await apiClient.get('/auth/me');
      user.value = ApiCurrentUserSchema.parse(response.data);
      isAuthenticated.value = true;
    } catch (err: any) {
      isAuthenticated.value = false;
      user.value = null;
      localStorage.removeItem('token');
    } finally {
      loading.value = false;
    }
  };

  const isUserAuthenticated = async () => {
    const response = await apiClient.get('/auth/is-authenticated');     
    isAuthenticated.value = response.data;
  };

  const sendResetPasswordEmail = async (email: string) => {
  clearState();
  loading.value = true;
  try {
    await apiClient.post('/auth/request-reset-password', { email });
    return true;
  } catch (error) {
    handleError(error, 'Erreur lors de la demande de réinitialisation.');
    return false;
  } finally {
    loading.value = false;
  }
};

  const resetPassword = async (token: string, newPassword: string) => {
    clearState();
    loading.value = true;
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword
      });
      return true;
    } catch (error) {
      handleError(error, 'Erreur lors de la réinitialisation du mot de passe.');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const checkResetToken = async (token: string) => {
    try {
      await apiClient.get(`/auth/reset-password/validate?token=${token}`);
      return true;
    } catch (error) {
      handleError(error, 'Token invalide ou expiré.');
      return false;
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    loading,
    errorMessage,
    clearState,
    verifyAuth,
    authAlreadyChecked,
    sendResetPasswordEmail,
    resetPassword,
    checkResetToken,
    isUserAuthenticated
  };
});
