import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/config/axios'
import { UserSchema, type ChangePasswordData, type User } from '@/schemas/user.schema'
import { handleError } from '@/utils/handleError'

export const useUserStore = defineStore('userStore', () => {
  const user = ref<User>()
  const loading = ref(false)

  const fetchCurrentUser = async () => {
    loading.value = true
    try {
      const { data } = await apiClient.get<User>('/users/me')
      console.log('data', data);
      
      user.value = UserSchema.parse(data)
    } catch (error) {
      handleError(error, 'Erreur lors du chargement de l’utilisateur.')
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (payload: Partial<User>) => {
    loading.value = true
    try {
      const { data } = await apiClient.patch('/users/me', payload)
      user.value = UserSchema.parse(data)
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour du profil.')
      throw error
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (payload: ChangePasswordData) => {
    loading.value = true
    try {
      const { data } = await apiClient.patch('/users/me/password', payload)
      user.value = UserSchema.parse(data)
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour du profil.')
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteAccount = async () => {
    loading.value = true
    try {
      await apiClient.delete('/users/me')
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour du profil.')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetch2FAStatus() {
    loading.value = true
    try {
      const res = await apiClient.get('/users/me')
      return !!res.data.isTwoFactorEnabled
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération du statut 2FA.')
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    fetchCurrentUser,
    updateProfile,
    changePassword,
    deleteAccount,
    fetch2FAStatus
  }
})
