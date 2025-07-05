<template>
  <div class="ml-4 mt-8">
    <div class="flex items-center justify-between mb-10">
      <h1 class="text-xl font-bold">Liste des devis</h1>
      <v-btn color="primary" @click="showTemplateModal = true">
        <v-icon start>mdi-plus</v-icon>
        Nouveau devis
      </v-btn>
    </div>

    <SearchInput
      v-model="search"
      placeholder="Rechercher un devis"
      @search="fetchQuotes"
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
    :fetchTemplates="fetchInvoiceTemplates"
    @templateSelected="handleInvoiceTemplateSelected"
  />

  <TemplateSelectionModal
    v-model="showContractTemplateModal"
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

const search = ref('')
const quoteTemplateStore = useQuoteTemplateStore();
const invoiceTemplateStore = useInvoiceTemplateStore();
const quoteStore = useQuoteStore();
const contractTemplateStore = useContractTemplateStore()

const { showToast } = useToastHandler();
const router = useRouter();

const showTemplateModal = ref(false);
const showStatusModal = ref(false);  
const quotes = computed(() => quoteStore.quotes);

const isDeleteModalOpen = ref(false);
const selectedQuoteId = ref<string | null>(null);

const quoteToConvert = ref<Quote | null>(null)

const showInvoiceTemplateModal = ref(false)
const showContractTemplateModal = ref(false)

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
  const term = search.value.trim()
  if (term === '') {
    await quoteStore.fetchAllQuotes()
  } else {
    await quoteStore.searchQuotes(term)
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

watch(search, async () => {
  await fetchQuotes();
});

</script>
