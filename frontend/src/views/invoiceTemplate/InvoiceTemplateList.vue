<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <span class="text-xl font-semibold">Templates de factures</span>
      <v-btn color="primary" @click="createTemplate">
        <v-icon start>mdi-plus</v-icon>
        Nouveau template
      </v-btn>
    </div>

    <SearchInput
      v-model="search"
      placeholder="Rechercher un template"
      @search="handleSearch"
    />

    <DataTable
      :headers="headers"
      :items="templates"
      :items-length="templates.length"
      @update:options="fetchAllTemplates"
    >
      <template #item.actions="{ item }">
        <v-btn icon @click="editTemplate(item.id)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon @click="duplicateTemplate(item.id)">
          <v-icon>mdi-content-duplicate</v-icon>
        </v-btn>
        <v-btn icon color="primary" @click="openDeleteConfirmation(item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </DataTable>

    <ConfirmationModal
      v-model="isDeleteModalOpen"
      title="Confirmation de suppression"
      message="Êtes-vous sûr de vouloir supprimer ce template de facture ? Cette action est irréversible."
      confirmText="Supprimer"
      cancelText="Annuler"
      confirmColor="error"
      @confirm="confirmDeleteTemplate"
    />
  </div>
</template>

<script setup lang="ts">
import { useToastHandler } from '@/composables/useToastHandler'
import { useInvoiceTemplateStore } from '@/stores/invoiceTemplate'
import type { ToastStatus } from '@/types'
import type { Header } from '@/types/Header'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '@/components/DocumentDisplay/DataTable.vue'
import ConfirmationModal from '@/components/Modals/ConfirmationModal.vue'
import SearchInput from '@/components/SearchInput.vue'

const search = ref('')
const router = useRouter()
const invoiceTemplate = useInvoiceTemplateStore()
const { showToast } = useToastHandler()
const isDeleteModalOpen = ref(false)
const selectedTemplateId = ref<string | null>(null)

const headers: Header[] = [
  { title: 'Nom', value: 'name', sortable: true },
  { title: 'Contenu', value: 'contentHtml', sortable: true },
  { title: 'Actions', value: 'actions', sortable: false },
]

const templates = computed(() => invoiceTemplate.templates)

const fetchAllTemplates = async () => {
  invoiceTemplate.fetchAllTemplates(false)
}

const createTemplate = () => {
  router.push({ name: 'InvoiceTemplateForm' })
}

const editTemplate = (id: string) => {
  router.push({ name: 'InvoiceTemplateEdit', params: { id } })
}

const duplicateTemplate = async (id: string) => {
  const duplicated = await invoiceTemplate.duplicateTemplate(id)

  if (duplicated) {
    showToast('success', `Duplication effectuée, ${duplicated.name} a été crée.`)
    fetchAllTemplates()
  }
}

function openDeleteConfirmation(id: string) {
  selectedTemplateId.value = id
  isDeleteModalOpen.value = true
}

async function confirmDeleteTemplate() {
  if (!selectedTemplateId.value) return
  await invoiceTemplate.deleteTemplate(selectedTemplateId.value)
  await fetchAllTemplates()
  showToast('success', 'Le template a été bien supprimé !')
  selectedTemplateId.value = null
}

async function handleSearch(term: string) {
  if (term.trim() === '') {
    await invoiceTemplate.fetchAllTemplates(false)
  } else {
    await invoiceTemplate.searchTemplates(term)
  }
}

onMounted(async () => {
  const status = history.state?.toastStatus as ToastStatus
  const message = history.state?.toastMessage as string

  if (message && status) {
    showToast(status, message)
  }

  await fetchAllTemplates()
})
</script>
