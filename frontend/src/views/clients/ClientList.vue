<template>
    <div class="p-4">
      <h1 class="text-xl font-bold mb-4">Clients</h1>
      <div class="mb-4 flex justify-between items-center">
        <input v-model="search" placeholder="Rechercher un client" class="border p-2 rounded" />
        <router-link to="/clients/new" class="bg-blue-500 text-white px-4 py-2 rounded">
          Nouveau client
        </router-link>
      </div>
  
      <table v-if="!store.isLoading" class="w-full table-auto border">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2">Prénom</th>
            <th class="p-2">Nom</th>
            <th class="p-2">Email</th>
            <th class="p-2">Ville</th>
            <th class="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredClients.length > 0" v-for="client in filteredClients" :key="client.id" class="border-t">
            <td class="p-2">{{ client.firstName }}</td>
            <td class="p-2">{{ client.lastName }}</td>
            <td class="p-2">{{ client.email }}</td>
            <td class="p-2">{{ client.city }}</td>
            <td class="p-2 space-x-2">
              <router-link :to="`/clients/${client.id}/edit`" class="text-blue-600">Modifier</router-link>
              <button @click="deleteClient(client.id)" class="text-red-500">Supprimer</button>
            </td>
          </tr>
          <tr v-else>
            <td colspan="5" class="text-center p-4">Aucun client trouvé.</td>
          </tr>
        </tbody>
      </table>
  
      <p v-else>Chargement...</p>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watchEffect } from 'vue'
  import { useClientStore } from '@/stores/client'
  import { useAuthStore } from '@/stores/auth'
  
  const store = useClientStore()
  const authStore = useAuthStore()
  const search = ref('')
  
  onMounted(async () => {
    if (!authStore.authAlreadyChecked) {
      await authStore.verifyAuth()
    }
    if (authStore.user) {
      await store.fetchAllClients()
    } else {
      console.warn('Aucun utilisateur connecté. Pas de clients à afficher.')
    }
  })
  
  const filteredClients = computed(() => {
    const query = search.value.trim().toLowerCase()
    if (!query) return store.clients
    return store.clients.filter(client =>
      (client.firstName?.toLowerCase() ?? '').includes(query) ||
      (client.lastName?.toLowerCase() ?? '').includes(query) ||
      (client.email?.toLowerCase() ?? '').includes(query) ||
      (client.city?.toLowerCase() ?? '').includes(query)
    )
  })
  
  watchEffect(() => {
    console.log('Clients visibles à l’écran :', filteredClients.value)
  })
  
  const deleteClient = async (id) => {
    await store.deleteClient(id)
    await store.fetchAllClients()
  }
  </script>
  