<template>
  <DataTable
    :headers="headers"
    :items="templates"
    :items-length="templates.length"
    @update:options="fetchAllTemplates"
  >
    <template #top.title>
      <span class="text-xl font-semibold">Templates de contrats</span>
    </template>

    <template #top.actions>
      <v-btn color="primary" @click="createTemplate">
        <v-icon start>mdi-plus</v-icon>
        Nouveau template
      </v-btn>
    </template>

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
    title="Supprimer ce template ?"
    message="Êtes-vous sûr de vouloir supprimer ce template de contrat ? Cette action est irréversible."
    confirmText="Supprimer"
    cancelText="Annuler"
    confirmColor="error"
    @confirm="confirmDeleteTemplate"
  />
</template>

<script setup lang="ts">
import { useToastHandler } from '@/composables/useToastHandler'
import { useContractTemplateStore } from '@/stores/contractTemplate'
import type { ToastStatus } from '@/types'
import type { Header } from '@/types/Header'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '@/components/Table/DataTable.vue'
import ConfirmationModal from '@/components/Modals/ConfirmationModal.vue'

const router = useRouter()
const contractTemplate = useContractTemplateStore()
const { showToast } = useToastHandler()
const isDeleteModalOpen = ref(false)
const selectedTemplateId = ref<string | null>(null)

const headers: Header[] = [
  { title: 'Nom', value: 'name', sortable: true },
  { title: 'Contenu', value: 'contentHtml', sortable: true },
  { title: 'Actions', value: 'actions', sortable: false },
]

const templates = computed(() => contractTemplate.templates)

const fetchAllTemplates = async () => {
  contractTemplate.fetchAllTemplates(false)
}

const createTemplate = () => {
  router.push({ name: 'ContractTemplateForm' })
}

const editTemplate = (id: string) => {
  router.push({ name: 'ContractTemplateEdit', params: { id } })
}

const duplicateTemplate = async (id: string) => {
  const duplicated = await contractTemplate.duplicateTemplate(id)

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
  await contractTemplate.deleteTemplate(selectedTemplateId.value)
  await fetchAllTemplates()
  showToast('success', 'Le template a été bien supprimé !')
  selectedTemplateId.value = null
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
