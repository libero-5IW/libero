import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/config/axios'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  companyName: string
  addressLine: string
  postalCode: string
  city: string
  country: string
  legalStatus: string
  siret: string
  tvaNumber: string
  createdAt: string
}

export const useUserStore = defineStore('userStore', () => {
  const users = ref<User[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchUsers = async () => {
    loading.value = true;
    error.value = null;

    try {
      const res = await apiClient.get<User[]>('/users');
      users.value = res.data;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des utilisateurs';
    } finally {
      loading.value = false;
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
  }
})
