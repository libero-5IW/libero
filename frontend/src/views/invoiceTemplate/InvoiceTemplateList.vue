<template>
  <div class="ml-4 mt-8">
    <div class="flex items-center justify-between mb-6">
      <span class="text-xl font-semibold">Templates de factures</span>
      <div class="flex gap-2">
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

    <div class="flex items-center gap-4 mb-6">
      <SearchInput
        v-model="search"
        placeholder="Rechercher un template"
        class="w-64"
        density="compact"
        hide-details
      />

      <v-text-field
        v-model="startDate"
        label="Date de début"
        type="date"
        density="compact"
        class="w-48"
        hide-details
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
        type="date"
        density="compact"
        class="w-48"
        hide-details
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
    >
      <v-icon size="48" class="mb-4" color="grey">mdi-file-document-outline</v-icon>
      <p>Aucun template de facture créé pour le moment.</p>
    </div>

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

  <Pagination
    :total-items="invoiceTemplate.total"
    :current-page="invoiceTemplate.currentPage"
    :page-size="invoiceTemplate.pageSize"
    @page-changed="handlePageChange"
  />
</template>

<script setup lang="ts">
import { useToastHandler } from '@/composables/useToastHandler'
import { useInvoiceTemplateStore } from '@/stores/invoiceTemplate'
import type { TemplateDocumentCard, ToastStatus } from '@/types'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import TemplateDocumentCardList from '@/components/DocumentDisplay/TemplateDocumentCardList.vue';
import ConfirmationModal from '@/components/Modals/ConfirmationModal.vue'
import SearchInput from '@/components/SearchInput.vue'
import Pagination from '@/components/Pagination.vue'

const search = ref('')
const router = useRouter()
const invoiceTemplate = useInvoiceTemplateStore()
const { showToast } = useToastHandler()
const isDeleteModalOpen = ref(false)
const selectedTemplateId = ref<string | null>(null)
const isLoading = computed(() => invoiceTemplate.isLoading)
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
  if (term.trim() === '' && !startDate.value && !endDate.value) {
    await invoiceTemplate.fetchAllTemplates(false)
  } else {
    await invoiceTemplate.searchTemplates(term, startDate.value, endDate.value)
  }
}

async function handlePageChange(page: number) {
  await invoiceTemplate.searchTemplates(
    search.value,
    startDate.value,
    endDate.value,
    page
  )
}

async function exportTemplatesAsCSV() {
  try {
    await invoiceTemplate.exportInvoiceTemplates(
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
  await invoiceTemplate.searchTemplates(
    search.value,
    startDate.value,
    endDate.value,
    1
  )
})

onMounted(async () => {
  const status = history.state?.toastStatus as ToastStatus
  const message = history.state?.toastMessage as string

  if (message && status) {
    showToast(status, message)
  }

  await invoiceTemplate.searchTemplates('', null, null, 1)
})
</script>
