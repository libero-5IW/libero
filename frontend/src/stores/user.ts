import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/config/axios'
import type { ChangePasswordData, User } from '@/schemas/user.schema'

export const useUserStore = defineStore('userStore', () => {
  const user = ref<User>()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCurrentUser = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.get<User>('/users/me')
      user.value = res.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement de l’utilisateur'
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.patch<User>('/users/me', data)
      user.value = res.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour du profil.'
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (data: ChangePasswordData) => {
    loading.value = true
    error.value = null
    try {
      await apiClient.patch('/users/me/password', data)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du changement de mot de passe.'
    } finally {
      loading.value = false
    }
  }

  const deleteAccount = async () => {
    loading.value = true
    error.value = null
    try {
      await apiClient.delete('/users/me')
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression du compte.'
    } finally {
      loading.value = false
    }
  }

  async function fetch2FAStatus() {
    try {
      const res = await apiClient.get('/users/me')
      return !!res.data.isTwoFactorEnabled
    } catch (err: any) {
      throw err.response?.data?.message || 'Erreur lors de la récupération du statut 2FA'
    }
  }

  return {
    user,
    loading,
    error,
    fetchCurrentUser,
    updateProfile,
    changePassword,
    deleteAccount,
    fetch2FAStatus
  }
})
