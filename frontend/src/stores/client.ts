import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/config/axios'
import { handleError } from '@/utils/handleError'
import { ClientCreateSchema, ClientSchema, type Client } from '@/schemas/client.schema'

export const useClientStore = defineStore('client', () => {
  const clients = ref<Client[]>([])
  const currentClient = ref<Client | null>(null)
  const isLoading = ref(false)

  async function fetchAllClients() {
    isLoading.value = true;
    try {
      const { data } = await apiClient.get('/clients');
      clients.value = (data as any[]).map((item: any) => ClientSchema.parse(item));
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération des clients.');
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchClient(id: string) {
    isLoading.value = true
    try {
      const { data } = await apiClient.get(`/clients/${id}`)
      currentClient.value = ClientSchema.parse(data)
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération du client.')
    } finally {
      isLoading.value = false
    }
  }

  async function createClient(payload: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
    try {   
      const validatedPayload  = ClientCreateSchema.parse(payload);
      const { data } = await apiClient.post('/clients', validatedPayload)      
      return ClientSchema.parse(data)
    } catch (error) {
      handleError(error, 'Erreur lors de la création du client.')
    }
  }

  async function updateClient(id: string, payload: Partial<Client>) {
    try {
      const validatedPayload  = ClientSchema.parse(payload);
      const { data } = await apiClient.patch(`/clients/${id}`, validatedPayload)
      return ClientSchema.parse(data)
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour du client.')
    }
  }

  async function deleteClient(id: string) {
    try {
      await apiClient.delete(`/clients/${id}`)
      clients.value = clients.value.filter(client => client.id !== id)
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression du client.')
    }
  }

  async function searchClients(term: string) {
    isLoading.value = true
    try {
      const { data } = await apiClient.get(`/clients/search/${encodeURIComponent(term)}`)
      clients.value = data.map((item: any) => ClientSchema.parse(item))
    } catch (error) {
      clients.value = []
      handleError(error, 'Erreur lors de la recherche des clients.')
    } finally {
      isLoading.value = false
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
    deleteClient,
    searchClients
  }
})
