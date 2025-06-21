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
      <v-btn icon @click="deleteClient(item.id)">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import { useClientStore } from '@/stores/client'
import { useRouter } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useToastHandler } from '@/composables/useToastHandler'
import type { ToastStatus } from '@/types'
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
  { title: 'Actions', value: 'actions', sortable: false },
]

async function fetchAllClients() {
  await clientStore.fetchAllClients()
}

const createClient = () => {
  router.push({ name: 'ClientCreate' })
}

const editClient = (id: string) => {
  router.push({ name: 'ClientEdit', params: { id } })
}

const deleteClient = async (id: string) => {
  await clientStore.deleteClient(id)
  await fetchAllClients()
  showToast('success', 'Client supprimé avec succès.')
}

onMounted(async () => {
  const status = history.state?.toastStatus as ToastStatus
  const message = history.state?.toastMessage as string

  if (message && status) {
    showToast(status, message)
  }

  await fetchAllClients()
})
</script>
