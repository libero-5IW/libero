<template>
  <div class="flex flex-col min-h-screen ml-4 focus:outline-none" role="main" aria-labelledby="quote-page-title" tabindex="-1" ref="mainContent">
    <Heading>Liste des devis</Heading>
    
    <div class="flex flex-col lg:flex-row flex-wrap w-full items-start justify-between gap-4 mb-6">
      <div class="flex w-full flex-col lg:w-auto lg:flex-row gap-4">
        <SearchInput
          v-model="search"
          placeholder="Rechercher un devis"
          class="w-full lg:w-80 text-base"
          density="comfortable"
          hide-details
          aria-label="Rechercher un devis"
          @search="fetchQuotes"
        />

        <v-select
          v-model="selectedStatus"
          :items="statusOptions"
          item-title="label"
          item-value="value"
          label="Filtrer par statut"
          class="w-full lg:w-64 text-base"
          density="comfortable"
          hide-details
          clearable
          aria-label="Filtrer les devis par statut"
          @update:modelValue="fetchQuotes"
        />

        <v-text-field
          v-model="startDate"
          label="Date de début"
          type="date"
          class="w-full lg:w-64 text-base"
          density="comfortable"
          hide-details
          aria-label="Filtrer par date de début d’envoi au client"
        >
          <template #append-inner>
            <v-tooltip text="Date d'envoi" location="top">
              <template #activator="{ props }">
                <v-icon v-bind="props" icon="mdi-information-outline" class="ml-1" size="18" />
              </template>
            </v-tooltip>
          </template>
        </v-text-field>

        <v-text-field
          v-model="endDate"
          label="Date de fin"
          type="date"
          class="w-full lg:w-64 text-base"
          density="comfortable"
          hide-details
          aria-label="Filtrer par date de fin d’envoi au client"
        >
          <template #append-inner>
            <v-tooltip text="Date d'envoi" location="top">
              <template #activator="{ props }">
                <v-icon v-bind="props" icon="mdi-information-outline" class="ml-1" size="18" />
              </template>
            </v-tooltip>
          </template>
        </v-text-field>
      </div>

      <div class="flex w-full flex-col lg:w-auto lg:flex-row gap-2">
        <v-btn color="primary" @click="showTemplateModal = true">
          <v-icon start>mdi-plus</v-icon>
          Nouveau devis
        </v-btn>
        <v-btn color="primary" @click="exportQuotesAsCSV">
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
      <DocumentCardList
        :items="documentCards"
        titlePrefix="Devis"
        type="quote"
        @edit="editQuote"
        @change-status="openStatusModal"
        @delete="openDeleteConfirmation"
        @sent-to-client="openSentConfirmation"
        @convert-to-invoice="handleConvertToInvoice"
        @convert-to-contract="handleConvertToContract"
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
      <p>Aucun devis créé pour le moment.</p>
    </div>

      <div class="mt-auto mb-3 items-center justify-center">
          <Pagination
          :total-items="quoteStore.total"
          :current-page="quoteStore.currentPage"
          :page-size="quoteStore.pageSize"
          @page-changed="handlePageChange"
        />
      </div>
  </div>

  <ConfirmationModal
  v-model="isEmailSentModalOpen"
  title="Confirmation d'envoi d'email"
  message="Souhaitez-vous envoyer par email ce devis au client ? Le statut du devis restera ou sera changé à Envoyé."
  confirmText="Envoyer"
  cancelText="Annuler"
  confirmColor="success"
  @confirm="confirmSentQuote"
  />
  
  <ConfirmationModal
  v-model="isDeleteModalOpen"
  title="Confirmation de suppression"
  message="Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible."
  confirmText="Supprimer"
  cancelText="Annuler"
  confirmColor="error"
  @confirm="confirmDeleteQuote"
  />

  <StatusChangingModal
  v-model="isStatusModalOpen"
  :current-status="selectedQuoteStatus"
  :available-statuses="statusModalAvailableStatuses"
  @change="updateQuoteStatus"
  />
  
  <TemplateSelectionModal 
    v-model="showTemplateModal"
    type="devis"
    :fetchTemplates="fetchQuoteTemplates"
    @templateSelected="handleTemplateSelected"
  />

  <TemplateSelectionModal
    v-model="showInvoiceTemplateModal"
    type="facture"
    :fetchTemplates="fetchInvoiceTemplates"
    @templateSelected="handleInvoiceTemplateSelected"
  />

  <TemplateSelectionModal
    v-model="showContractTemplateModal"
    type="contrat"
    :fetchTemplates="fetchContractTemplates"
    @templateSelected="handleContractTemplateSelected"
  />
</template>

<script setup lang="ts">

import { ref, computed, onMounted, watch } from 'vue';
import { useQuoteStore } from '@/stores/quote';
import TemplateSelectionModal from '@/components/Modals/TemplateSelectionModal.vue'; 
import { useToastHandler } from '@/composables/useToastHandler';
import type { DocumentCard, ToastStatus } from '@/types';
import { useRouter } from 'vue-router';
import { useQuoteTemplateStore } from '@/stores/quoteTemplate';
import ConfirmationModal from '@/components/Modals/ConfirmationModal.vue';
import DocumentCardList from '@/components/DocumentDisplay/DocumentCardList.vue'
import { useInvoiceTemplateStore } from '@/stores/invoiceTemplate';
import type { Quote } from '@/schemas/quote.schema'
import { mapQuoteToInvoiceVariables } from '@/utils/mapQuoteToInvoice'
import { mapQuoteToContractVariables } from '@/utils/mapQuoteToContract'
import { useContractTemplateStore } from '@/stores/contractTemplate'
import SearchInput from '@/components/SearchInput.vue'
import { QUOTE_STATUS } from '@/constants/status/quote-status.constant';
import Pagination from '@/components/Pagination.vue';
import StatusChangingModal from '@/components/Modals/StatusChangingModal.vue';
import Heading from '@/components/Header/Heading.vue';

const search = ref('')
const quoteTemplateStore = useQuoteTemplateStore();
const invoiceTemplateStore = useInvoiceTemplateStore();
const quoteStore = useQuoteStore();
const contractTemplateStore = useContractTemplateStore()
const selectedStatus = ref<string | null>(null);
const startDate = ref<string | null>(null)
const endDate = ref<string | null>(null)

const { showToast } = useToastHandler();
const router = useRouter();

const showTemplateModal = ref(false);
const quotes = computed(() => quoteStore.quotes);
const isLoading = computed(() => quoteStore.isLoading)

const selectedQuoteId = ref<string | null>(null);
const isEmailSentModalOpen = ref(false);
const isDeleteModalOpen = ref(false);

const isStatusModalOpen = ref(false)
const selectedQuoteStatus = ref<string>('draft');
const statusModalAvailableStatuses = ref<{ value: string; label: string; description?: string }[]>([]);

const quoteToConvert = ref<Quote | null>(null)

const showInvoiceTemplateModal = ref(false)
const showContractTemplateModal = ref(false)

const statusOptions = [
  { label: 'Tous', value: null },
  { label: 'Brouillon', value: QUOTE_STATUS.DRAFT },
  { label: 'Envoyé', value: QUOTE_STATUS.SENT },
  { label: 'Accepté', value: QUOTE_STATUS.ACCEPTED },
  { label: 'Refusé', value: QUOTE_STATUS.REFUSED },
];

const documentCards = computed<DocumentCard[]>(() =>
  quotes.value.map((quote): DocumentCard  => {
      const clientNameVar = quote.variableValues?.find(
          (v) => v.variableName === 'client_name'
      );
      
    return {
      id: quote.id,
      number: quote.number,
      status: quote.status,
      createdAt: quote.createdAt ?? '',
      previewUrl: quote.previewUrl ?? null,
      pdfUrl: quote.pdfUrl ?? null,
      clientName: clientNameVar?.value || 'Client inconnu',
      clientId: quote.clientId
    }
  })
);

const allStatuses = [
  { value: QUOTE_STATUS.SENT, label: 'Envoyé', description: 'Pas d\'email avec modification manuelle' },
  { value: QUOTE_STATUS.ACCEPTED, label: 'Accepté' },
  { value: QUOTE_STATUS.REFUSED, label: 'Refusé' },
];

function getAvailableStatuses(currentStatus: string) {
  switch (currentStatus) {
    case QUOTE_STATUS.DRAFT:
      return [allStatuses[0]]; // sent
    case QUOTE_STATUS.SENT:
      return [allStatuses[1], allStatuses[2]]; // accepted, refused
    case QUOTE_STATUS.ACCEPTED:
      return [allStatuses[0], allStatuses[2]]; // sent, refused
    case QUOTE_STATUS.REFUSED:
      return [allStatuses[0], allStatuses[1]]; // sent, accepted
    default:
      return [];
  }
}

async function updateQuoteStatus(newStatus: string) {
  if (!selectedQuoteId.value) return;
  const quote = await quoteStore.changeStatus(selectedQuoteId.value, newStatus);
  isStatusModalOpen.value = false;
  if(quote) { 
    await fetchAllQuotes();
    showToast('success', `Statut mis à jour avec succès pour le devis ${quote?.number} !`);
  }
  selectedQuoteId.value = null;
}

async function fetchQuoteTemplates() {
  await quoteTemplateStore.fetchAllTemplates();

  const list: { id: string; name: string }[] = [];

  list.push(
    ...quoteTemplateStore.templates
      .filter(t => !!t.id)
      .map(t => ({
        id: t.id as string,
        name: t.name,
      }))
  );

  return list;
}

function handleConvertToInvoice(card: DocumentCard) {
  const fullQuote = quoteStore.quotes.find(q => q.id === card.id)

  if (!fullQuote) {
    showToast('error', 'Impossible de trouver le devis à convertir.')
    return
  }

  quoteToConvert.value = fullQuote
  showInvoiceTemplateModal.value = true
}

function handleConvertToContract(card: DocumentCard) {
  const fullQuote = quoteStore.quotes.find(q => q.id === card.id)

  if (!fullQuote) {
    showToast('error', 'Impossible de trouver le devis à convertir en contrat.')
    return
  }

  quoteToConvert.value = fullQuote
  showContractTemplateModal.value = true
}

const fetchAllQuotes = async () => {
  await quoteStore.fetchAllQuotes();
};

const handleTemplateSelected = (templateId: string) => {
  showTemplateModal.value = false;

  router.push({ 
    name: 'QuoteForm', 
    query: { templateId }   
  });
};

const editQuote = (id: string) => {
  router.push({ name: 'QuoteEdit', params: { id } });
};

function openDeleteConfirmation(id: string) {
  selectedQuoteId.value = id;
  isDeleteModalOpen.value = true;
}

function openSentConfirmation(id: string) {
  selectedQuoteId.value = id;
  isEmailSentModalOpen.value = true;
}

function openStatusModal(id: string) {
  const quote = quoteStore.quotes.find(q => q.id === id);
  if (!quote) return;

  selectedQuoteId.value = id;
  selectedQuoteStatus.value = quote.status;
  statusModalAvailableStatuses.value = getAvailableStatuses(quote.status);
  isStatusModalOpen.value = true;
}

async function handlePageChange(page: number) {
  await quoteStore.searchQuotes(
    search.value,
    selectedStatus.value,
    startDate.value,
    endDate.value,
    page
  );
}

async function fetchInvoiceTemplates() {
  await invoiceTemplateStore.fetchAllTemplates()
  return invoiceTemplateStore.templates
  .filter(t => typeof t.id === 'string')
  .map(t => ({
    id: t.id as string,
    name: t.name
  }))
}

async function fetchContractTemplates() {
  await contractTemplateStore.fetchAllTemplates()

  return contractTemplateStore.templates
    .filter(t => typeof t.id === 'string')
    .map(t => ({
      id: t.id as string,
      name: t.name
    }))
}

async function handleInvoiceTemplateSelected(templateId: string) {
  await invoiceTemplateStore.fetchTemplate(templateId)

  const invoiceTemplate = invoiceTemplateStore.currentTemplate
  const quote = quoteToConvert.value

  if (!invoiceTemplate || !quote) {
    showToast('error', 'Impossible de créer une facture à partir de ce devis.')
    return
  }

  const mappedVariables = mapQuoteToInvoiceVariables(
    invoiceTemplate.variables,
    quote.variableValues
  )

  router.push({
    name: 'InvoiceForm',
    state: {
      fromQuoteId: quote.id,
      templateId,
      clientId: quote.clientId,
      variables: mappedVariables
    }
  })
}

async function handleContractTemplateSelected(templateId: string) {
  await contractTemplateStore.fetchTemplate(templateId)

  const contractTemplate = contractTemplateStore.currentTemplate
  const quote = quoteToConvert.value

  if (!contractTemplate || !quote) {
    showToast('error', 'Impossible de créer un contrat à partir de ce devis.')
    return
  }

  const mappedVariables = mapQuoteToContractVariables(
    contractTemplate.variables,
    quote.variableValues
  )

  router.push({
    name: 'ContractForm',
    state: {
      fromQuoteId: quote.id,
      templateId,
      clientId: quote.clientId,
      variables: mappedVariables
    }
  })
}

async function confirmDeleteQuote() {
  if (!selectedQuoteId.value) return;
  await quoteStore.deleteQuote(selectedQuoteId.value);
  await fetchAllQuotes();
  showToast('success', 'Le devis a été bien supprimé !');
  selectedQuoteId.value = null;
}

async function confirmSentQuote() {
  if (!selectedQuoteId.value) return;
  const client = await quoteStore.sentQuoteToClient(selectedQuoteId.value);
  if (client) {
    await fetchAllQuotes();
    showToast('success', `Le devis a été bien été envoyé à ${client.firstName} ${client.lastName.toUpperCase()}!`);
  }
  selectedQuoteId.value = null;
}

async function exportQuotesAsCSV() {
  try {
    await quoteStore.exportQuotes(
      search.value,
      selectedStatus.value ?? undefined,
      startDate.value ?? undefined,
      endDate.value ?? undefined
    );
    showToast('success', 'Export CSV généré avec succès.');
  } catch (e) {
    showToast('error', 'Erreur lors de l’export CSV.');
  }
}

async function fetchQuotes() {
  const term = search.value?.trim() || '';
  const status = selectedStatus.value || undefined;
  const start = startDate.value || null;
  const end = endDate.value || null;

  if (!term && !status && !start && !end) {
    await quoteStore.fetchAllQuotes();
  } else {
    await quoteStore.searchQuotes(term, status, start, end);
  }
}

onMounted(async () => {
  const status = history.state?.toastStatus as ToastStatus;
  const message = history.state?.toastMessage as string;

  if (message && status) {
    showToast(status, message);
    
    history.replaceState(
      { ...history.state, toastStatus: null, toastMessage: null },
      ''
    );
  }

  await quoteStore.searchQuotes('', null, null, null, 1);
});

watch([search, selectedStatus, startDate, endDate], async () => {
  await quoteStore.searchQuotes(
    search.value,
    selectedStatus.value,
    startDate.value,
    endDate.value,
    1
  );
});

</script>
