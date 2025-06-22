<template>
  <DataTable
    :headers="headers"
    :items="clients"
    :items-length="clients.length"
    @update:options="fetchAllClients"
  >
    <template #top.title>
      <span class="text-xl font-semibold">Liste des clients</span>
    </template>

    <template #top.actions>
      <v-btn color="primary" @click="createClient">
        <v-icon start>mdi-plus</v-icon>
        Nouveau client
      </v-btn>
    </template>

    <template #item.actions="{ item }">
      <v-btn icon @click="editClient(item.id)">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn icon @click="removeClient(item.id)">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useClientStore } from '@/stores/client'
import { useRouter } from 'vue-router'
import { useToastHandler } from '@/composables/useToastHandler'
import type { Header } from '@/types/Header'
import DataTable from '@/components/Table/DataTable.vue'

const clientStore = useClientStore()
const router = useRouter()
const { showToast } = useToastHandler()

const clients = computed(() => clientStore.clients)

const headers: Header[] = [
  { title: 'Prénom', value: 'firstName', sortable: true },
  { title: 'Nom', value: 'lastName', sortable: true },
  { title: 'Email', value: 'email', sortable: true },
  { title: 'Ville', value: 'city', sortable: true },
  { title: 'Actions', value: 'actions', sortable: false }
]

const fetchAllClients = async () => {
  try {
    await clientStore.fetchAllClients()
  } catch (error) {
    showToast('error', 'Erreur lors du chargement des clients.')
  }
}

const createClient = () => {
  router.push({ name: 'ClientCreate' })
}

const editClient = (id: string) => {
  router.push({ name: 'ClientEdit', params: { id } })
}

const removeClient = async (id: string) => {
  try {
    await clientStore.deleteClient(id)
    await fetchAllClients()
    showToast('success', 'Le client a été supprimé avec succès.')
  } catch (error) {
    showToast('error', 'Une erreur est survenue lors de la suppression.')
  }
}

onMounted(async () => {
  await fetchAllClients()
})
</script>
