<template>
  <div class="ml-4 mt-8">
    <div class="flex items-center justify-between mb-6">
      <span class="text-xl font-semibold">Liste des clients</span>
      <v-btn color="primary" @click="createClient">
        <v-icon start>mdi-plus</v-icon>
        Nouveau client
      </v-btn>
    </div>

    <SearchInput
      v-model="search"
      placeholder="Rechercher un client"
      @search="handleSearch"
    />

    <DataTable
      :headers="headers"
      :items="clients"
      :items-length="clients.length"
      @update:options="fetchAllClients"
    >
      <template #item.actions="{ item }">
        <div class="flex gap-3 items-center">
          <v-tooltip text="Modifier" location="top">
            <template #activator="{ props }">
              <v-icon
                v-bind="props"
                color="secondary"
                class="cursor-pointer text-gray-600 hover:text-primary transition-colors duration-200"
                @click="editClient(item.id)"
              >
                mdi-pencil
              </v-icon>
            </template>
          </v-tooltip>

          <v-tooltip text="Supprimer" location="top">
            <template #activator="{ props }">
              <v-icon
                v-bind="props"
                color="primary"
                class="cursor-pointer"
                @click="confirmDelete(item.id)"
              >
                mdi-delete
              </v-icon>
            </template>
          </v-tooltip>
        </div>
      </template>
    </DataTable>

    <ConfirmationModal
      v-model="showDeleteModal"
      title="Confirmer la suppression"
      message="Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible."
      confirmText="Supprimer"
      confirmColor="error"
      cancelText="Annuler"
      @confirm="removeClient"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useClientStore } from '@/stores/client'
import { useRouter } from 'vue-router'
import { useToastHandler } from '@/composables/useToastHandler'
import type { Header } from '@/types/Header'
import type { ToastStatus } from '@/types'
import DataTable from '@/components/DocumentDisplay/DataTable.vue'
import ConfirmationModal from '@/components/Modals/ConfirmationModal.vue'
import SearchInput from '@/components/SearchInput.vue'

const clientStore = useClientStore()
const router = useRouter()
const { showToast } = useToastHandler()
const search = ref('')

const clientIdToDelete = ref<string | null>(null)
const showDeleteModal = ref(false)

const clients = computed(() => clientStore.clients)

const headers: Header[] = [
  { title: 'Prénom', value: 'firstName', sortable: true },
  { title: 'Nom', value: 'lastName', sortable: true },
  { title: 'Email', value: 'email', sortable: true },
  { title: 'Téléphone', value: 'phoneNumber', sortable: true },
  { title: '', value: 'actions', sortable: false },
]

const fetchAllClients = async () => {
  await clientStore.fetchAllClients()
}

const createClient = () => {
  router.push({ name: 'ClientCreate' })
}

const editClient = (id: string) => {
  router.push({ name: 'ClientEdit', params: { id } })
}

const confirmDelete = (id: string) => {
  clientIdToDelete.value = id
  showDeleteModal.value = true
}

const removeClient = async () => {
  if (!clientIdToDelete.value) return
  await clientStore.deleteClient(clientIdToDelete.value)
  showToast('success', 'Le client a été supprimé avec succès.')
  showDeleteModal.value = false
  clientIdToDelete.value = null
}

async function handleSearch(term: string) {
  if (term.trim() === '') {
    await clientStore.fetchAllClients()
  } else {
    await clientStore.searchClients(term)
  }
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
