import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/config/axios'
import { handleAxiosError } from '@/utils/handleAxiosError'
import { ClientSchema, type Client } from '@/schemas/client.schema'

export const useClientStore = defineStore('client', () => {
  const clients = ref<Client[]>([])
  const currentClient = ref<Client | null>(null)
  const isLoading = ref(false)

  async function fetchAllClients() {
    isLoading.value = true
    try {
      const { data } = await apiClient.get('/clients')
      console.log('Données brutes API:', data)   // 👈 Ajoute ça
      clients.value = data.map((item: Client) => ClientSchema.parse(item))
    } catch (error) {
      console.error('Erreur capturée:', error)   // 👈 Log l'erreur complète
      handleAxiosError(error, 'Erreur lors de la récupération des clients.')
    } finally {
      isLoading.value = false
    }
  }
  

  async function fetchClient(id: string) {
    isLoading.value = true
    try {
      const { data } = await apiClient.get(`/clients/${id}`)
      currentClient.value = ClientSchema.parse(data)
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la récupération du client.')
    } finally {
      isLoading.value = false
    }
  }

  async function createClient(payload: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const { data } = await apiClient.post('/clients', payload)
      return ClientSchema.parse(data)
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la création du client.')
    }
  }

  async function updateClient(id: string, payload: Partial<Client>) {
    try {
      const { data } = await apiClient.patch(`/clients/${id}`, payload)
      return ClientSchema.parse(data)
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la mise à jour du client.')
    }
  }

  async function deleteClient(id: string) {
    try {
      await apiClient.delete(`/clients/${id}`)
      clients.value = clients.value.filter(client => client.id !== id)
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la suppression du client.')
    }
  }

  return {
    clients,
    currentClient,
    isLoading,
    fetchAllClients,
    fetchClient,
    createClient,
    updateClient,
    deleteClient
  }
})
