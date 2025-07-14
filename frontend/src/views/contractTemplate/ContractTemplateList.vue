<template>
  <div class="flex flex-col min-h-screen ml-4 focus:outline-none" role="main" aria-labelledby="contract-template-page-title" tabindex="-1" ref="mainContent">
    <Heading>Liste des modèles de contrat</Heading>      
    
    <div class="flex flex-col lg:flex-row flex-wrap w-full items-start justify-between gap-4 mb-6">
      <div class="flex w-full flex-col lg:w-auto lg:flex-row gap-4">
        <SearchInput
          v-model="search"
          placeholder="Rechercher un template"
          class="w-full lg:w-80 text-base"
          density="comfortable"
          hide-details
          aria-label="Rechercher un template de contrat"
        />

        <v-text-field
          v-model="startDate"
          label="Date de début"
          type="date"
          class="w-full lg:w-64 text-base"
          density="comfortable"
          hide-details
          aria-label="Filtrer par date de début de création"
        >
          <template #append-inner>
            <v-tooltip text="Date de création" location="top">
              <template #activator="{ props }">
                <v-icon
                  v-bind="props"
                  icon="mdi-information-outline"
                  class="ml-1"
                  size="18"
                />
              </template>
            </v-tooltip>
          </template>
        </v-text-field>

        <v-text-field
          v-model="endDate"
          label="Date de fin"
          class="w-full lg:w-64 text-base"
          density="comfortable"
          hide-details
          aria-label="Filtrer par date de fin de création"
        >
          <template #append-inner>
            <v-tooltip text="Date de création" location="top">
              <template #activator="{ props }">
                <v-icon
                  v-bind="props"
                  icon="mdi-information-outline"
                  class="ml-1"
                  size="18"
                />
              </template>
            </v-tooltip>
          </template>
        </v-text-field>
      </div>

      <div class="flex w-full flex-col lg:w-auto lg:flex-row gap-2">
        <v-btn color="primary" @click="createTemplate">
          <v-icon start>mdi-plus</v-icon>
          Nouveau template
        </v-btn>
        <v-btn color="primary" @click="exportTemplatesAsCSV">
          <v-icon start>mdi-download</v-icon>
          Exporter CSV
        </v-btn>
      </div>
    </div>

    <v-progress-linear
      v-if="isLoading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <div v-if="documentCards.length > 0">
      <TemplateDocumentCardList
        :items="documentCards"
        @edit="editTemplate"
        @delete="openDeleteConfirmation"
        @duplicate="duplicateTemplate"
        :isLoading="isLoading"
      />
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center text-gray-500 text-lg h-[60vh]"
      role="status"
      aria-live="polite"
    >
      <v-icon size="48" class="mb-4" color="grey">mdi-file-document-outline</v-icon>
      <p>Aucun template de contrat créé pour le moment.</p>
    </div>

    <ConfirmationModal
      v-model="isDeleteModalOpen"
      title="Confirmation de suppression"
      message="Êtes-vous sûr de vouloir supprimer ce template de contrat ? Cette action est irréversible."
      confirmText="Supprimer"
      cancelText="Annuler"
      confirmColor="error"
      @confirm="confirmDeleteTemplate"
    />

    <div class="mt-auto mb-3 items-center justify-center">
      <Pagination
        :total-items="contractTemplate.total"
        :current-page="contractTemplate.currentPage"
        :page-size="contractTemplate.pageSize"
        @page-changed="handlePageChange"
      />
    </div>
  </div>


</template>

<script setup lang="ts">
import { useToastHandler } from '@/composables/useToastHandler'
import { useContractTemplateStore } from '@/stores/contractTemplate'
import type { TemplateDocumentCard, ToastStatus } from '@/types'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import ConfirmationModal from '@/components/Modals/ConfirmationModal.vue'
import TemplateDocumentCardList from '@/components/DocumentDisplay/TemplateDocumentCardList.vue';
import SearchInput from '@/components/SearchInput.vue'
import Pagination from '@/components/Pagination.vue'
import Heading from '@/components/Header/Heading.vue'

const search = ref('')
const router = useRouter()
const contractTemplate = useContractTemplateStore()
const { showToast } = useToastHandler()
const isDeleteModalOpen = ref(false)
const selectedTemplateId = ref<string | null>(null)
const isLoading = computed(() => contractTemplate.isLoading)
const startDate = ref<string | null>(null)
const endDate = ref<string | null>(null)

const documentCards = computed<TemplateDocumentCard[]>(() =>
  templates.value.map((template): TemplateDocumentCard  => {
    return {
      id: template.id,
      name: template.name,
      createdAt: template.createdAt ?? '',
      updatedAt: template.updatedAt ?? '',
      previewUrl: template.previewUrl ?? null,
      pdfUrl: template.pdfUrl ?? null,
      variablesLength: template.variables.length
    }
  })
);

const templates = computed(() => contractTemplate.templates)

const fetchAllTemplates = async () => {
  await contractTemplate.searchTemplates('', null, null, 1)
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
    await contractTemplate.searchTemplates('', null, null, 1)
  }
}

function openDeleteConfirmation(id: string) {
  selectedTemplateId.value = id
  isDeleteModalOpen.value = true
}

async function handlePageChange(page: number) {
  await contractTemplate.searchTemplates(
    search.value,
    startDate.value,
    endDate.value,
    page
  )
}

async function confirmDeleteTemplate() {
  if (!selectedTemplateId.value) return
  await contractTemplate.deleteTemplate(selectedTemplateId.value)
  await contractTemplate.searchTemplates('', null, null, 1)
  showToast('success', 'Le template a été bien supprimé !')
  selectedTemplateId.value = null
}

async function handleSearch(term: string) {
  if (term.trim() === '' && !startDate.value && !endDate.value) {
    await contractTemplate.searchTemplates('', null, null, 1)
  } else {
    await contractTemplate.searchTemplates(term, startDate.value, endDate.value)
  }
}

async function exportTemplatesAsCSV() {
  try {
    await contractTemplate.exportContractTemplates(
      search.value,
      startDate.value ?? undefined,
      endDate.value ?? undefined
    );
    showToast('success', 'Export CSV généré avec succès.');
  } catch (e) {
    showToast('error', 'Erreur lors de l’export CSV.');
  }
}

watch([search, startDate, endDate], async () => {
  await contractTemplate.searchTemplates(
    search.value,
    startDate.value,
    endDate.value,
    1
  );
});

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

  await contractTemplate.searchTemplates('', null, null, 1)
})
</script>
