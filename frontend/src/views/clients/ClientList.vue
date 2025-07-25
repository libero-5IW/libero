<template>
  <div
    class="flex flex-col min-h-screen ml-4 focus:outline-none"
    role="main"
    aria-labelledby="client-page-title"
    tabindex="-1"
    ref="mainContent"
  >
  <Heading>Liste des clients</Heading>  

    <div class="flex flex-col lg:flex-row flex-wrap w-full items-start justify-between gap-4 mb-6">
      <div class="flex w-full flex-col lg:w-auto lg:flex-row gap-4">
        <SearchInput
          v-model="search"
          placeholder="Rechercher un client"
          @search="handleSearch"
          class="w-full lg:w-80 text-base"
          density="comfortable"
          aria-label="Rechercher un client"
        />
      </div>

      <div class="flex w-full flex-col lg:w-auto lg:flex-row gap-2">
        <v-btn color="primary" @click="createClient">
          <v-icon start>mdi-plus</v-icon>
          Nouveau client
        </v-btn>
        <v-btn color="primary" @click="exportClientsAsCSV">
          <v-icon start>mdi-download</v-icon>
          Exporter CSV
        </v-btn>
      </div>
    </div>

    <DataTable
      :headers="headers"
      :items="clients"
      :items-length="clients.length"
      @update:options="fetchAllClients"
    >
      <template #item.actions="{ item }">
        <div class="flex gap-3 items-center">
          <v-tooltip text="Voir" location="top">
            <template #activator="{ props }">
              <v-icon
                v-bind="props"
                color="black"
                class="cursor-pointer text-gray-600 hover:text-primary transition-colors duration-200"
                @click="viewClient(item.id)"
                aria-label="Voir le client"
              >
                mdi-eye
              </v-icon>
            </template>
          </v-tooltip>

          <v-tooltip text="Modifier" location="top">
            <template #activator="{ props }">
              <v-icon
                v-bind="props"
                color="secondary"
                class="cursor-pointer text-gray-600 hover:text-primary transition-colors duration-200"
                @click="editClient(item.id)"
                aria-label="Modifier le client"
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
                aria-label="Supprimer le client"
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
import Heading from '@/components/Header/Heading.vue'

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

const viewClient = (id: string) => {
  router.push({ name: 'ClientView', params: { id } })
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

async function exportClientsAsCSV() {
  try {
    await clientStore.exportClients(search.value);
    showToast('success', 'Export CSV généré avec succès.');
  } catch (error) {
    showToast('error', 'Erreur lors de l’export CSV.');
  }
}

onMounted(async () => {
  const status = history.state?.toastStatus as ToastStatus
  const message = history.state?.toastMessage as string

  if (message && status) {
    showToast(status, message)

    history.replaceState(
      { ...history.state, toastStatus: null, toastMessage: null },
      ''
    );
  }

  await fetchAllClients()
})
</script>
