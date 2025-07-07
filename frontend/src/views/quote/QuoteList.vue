<template>
  <div class="ml-4 mt-8">
    <div class="flex items-center justify-between mb-10">
      <h1 class="text-xl font-bold">Liste des devis</h1>
      <v-btn color="primary" @click="showTemplateModal = true">
        <v-icon start>mdi-plus</v-icon>
        Nouveau devis
      </v-btn>
    </div>

    <div class="flex items-center gap-4 mb-6">
      <SearchInput
        v-model="search"
        placeholder="Rechercher un devis"
        @search="fetchQuotes"
      />

      <v-select
        v-model="selectedStatus"
        :items="statusOptions"
        item-title="label"
        item-value="value"
        label="Filtrer par statut"
        class="w-64"
        clearable
        @update:modelValue="fetchQuotes"
      />

      <v-text-field
        v-model="startDate"
        label="Date de début"
        type="date"
        class="w-48"
      />
      <v-text-field
        v-model="endDate"
        label="Date de fin"
        type="date"
        class="w-48"
      />

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
        @change-status="showStatusModal = true"
        @delete="openDeleteConfirmation"
        @convert-to-invoice="handleConvertToInvoice"
        @convert-to-contract="handleConvertToContract"
        :isLoading="isLoading"
      />
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center text-gray-500 text-lg h-[60vh]"
    >
      <v-icon size="48" class="mb-4" color="grey">mdi-file-document-outline</v-icon>
      <p>Aucun devis créé pour le moment.</p>
    </div>

  </div>

  <TemplateSelectionModal 
    v-model="showTemplateModal"
    type="devis"
    :fetchTemplates="fetchQuoteTemplates"
    @templateSelected="handleTemplateSelected"
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
import type { Header } from '@/types/Header';
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
const showStatusModal = ref(false);  
const quotes = computed(() => quoteStore.quotes);
const isLoading = computed(() => quoteStore.isLoading)

const isDeleteModalOpen = ref(false);
const selectedQuoteId = ref<string | null>(null);

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
      clientName: clientNameVar?.value || 'Client inconnu'
    }
  })
);

const headers: Header[] = [
  { title: 'Numéro', value: 'number', sortable: true },
  { title: 'Statut', value: 'status', sortable: true },
  { title: 'Date d\'émission', value: 'issuedAt', sortable: true },
  { title: 'Actions', value: 'actions', sortable: false },
];

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
  }

  await fetchAllQuotes();
});

watch([search, selectedStatus, startDate, endDate], async () => {
  await fetchQuotes();
});

</script>
