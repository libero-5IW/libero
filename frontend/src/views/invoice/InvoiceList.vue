<template>
  <div class="ml-4 mt-8">
    <div class="flex items-center justify-between mb-10">
      <h1 class="text-xl font-bold">Liste des factures</h1>
      <div class="flex gap-2">
        <v-btn color="primary" @click="showTemplateModal = true">
          <v-icon start>mdi-plus</v-icon>
          Nouveau facture
        </v-btn>
        <v-btn color="primary" @click="exportInvoicesAsCSV">
          <v-icon start>mdi-download</v-icon>
          Exporter CSV
        </v-btn>
      </div>
    </div>

    <div class="flex items-center gap-4 mb-6">
      <SearchInput
        v-model="search"
        placeholder="Rechercher une facture"
        class="w-64"
        density="compact"
        hide-details
        @search="fetchInvoices"
      />

      <v-select
        v-model="selectedStatus"
        :items="statusOptions"
        item-title="label"
        item-value="value"
        label="Filtrer par statut"
        class="w-48"
        density="compact"
        hide-details
        clearable
        @update:modelValue="fetchInvoices"
      />

      <v-text-field
        v-model="startDate"
        label="Date de début"
        type="date"
        class="w-48"
        density="compact"
        hide-details
      >
        <template #append-inner>
          <v-tooltip text="Date d'envoi" location="top">
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
        class="w-48"
        density="compact"
        hide-details
      >
        <template #append-inner>
          <v-tooltip text="Date d'envoi" location="top">
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
      <DocumentCardList
        :items="documentCards"
        titlePrefix="Facture"
        type="invoice"
        @edit="editInvoice"
        @change-status="showStatusModal = true"
        @delete="openDeleteConfirmation"
        :isLoading="isLoading"
      />
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center text-gray-500 text-lg h-[60vh]"
    >
      <v-icon size="48" class="mb-4" color="grey">mdi-file-document-outline</v-icon>
      <p>Aucune facture créée pour le moment.</p>
    </div>

  </div>

  <TemplateSelectionModal 
    v-model="showTemplateModal"
    type="facture"
    :fetchTemplates="fetchInvoiceTemplates"
    @templateSelected="handleTemplateSelected"
  />

  <ConfirmationModal
    v-model="isDeleteModalOpen"
    title="Confirmation de suppression"
    message="Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible."
    confirmText="Supprimer"
    cancelText="Annuler"
    confirmColor="error"
    @confirm="confirmDeleteInvoice"
  />

  <Pagination
    :total-items="invoiceStore.total"
    :current-page="invoiceStore.currentPage"
    :page-size="invoiceStore.pageSize"
    @page-changed="handlePageChange"
  />
</template>

<script setup lang="ts">

import { ref, computed, onMounted, watch } from 'vue';
import { useInvoiceStore } from '@/stores/invoice';
import DocumentCardList from '@/components/DocumentDisplay/DocumentCardList.vue';
import TemplateSelectionModal from '@/components/Modals/TemplateSelectionModal.vue'; 
import { useToastHandler } from '@/composables/useToastHandler';
import type { DocumentCard, ToastStatus } from '@/types';
import type { Header } from '@/types/Header';
import { useRouter } from 'vue-router';
import { useInvoiceTemplateStore } from '@/stores/invoiceTemplate';
import ConfirmationModal from '@/components/Modals/ConfirmationModal.vue';
import SearchInput from '@/components/SearchInput.vue';
import { INVOICE_STATUS } from '@/constants/status/invoice-status.constant';
import Pagination from '@/components/Pagination.vue';

const search = ref('');
const invoiceTemplateStore = useInvoiceTemplateStore();
const invoiceStore = useInvoiceStore();
const selectedStatus = ref<string | null>(null);

const { showToast } = useToastHandler();
const router = useRouter();
const startDate = ref<string | null>(null)
const endDate = ref<string | null>(null)

const showTemplateModal = ref(false);  
const showStatusModal = ref(false);  
const invoices = computed(() => invoiceStore.invoices);
const isLoading = computed(() => invoiceStore.isLoading)

const isDeleteModalOpen = ref(false);
const selectedInvoiceId = ref<string | null>(null);

const statusOptions = [
  { label: 'Tous', value: null },
  { label: 'Brouillon', value: INVOICE_STATUS.DRAFT },
  { label: 'Envoyée', value: INVOICE_STATUS.SENT },
  { label: 'Payée', value: INVOICE_STATUS.PAID },
  { label: 'En retard', value: INVOICE_STATUS.OVERDUE },
  { label: 'Annulée', value: INVOICE_STATUS.CANCELLED },
];

const documentCards = computed<DocumentCard[]>(() =>
  invoices.value.map((invoice): DocumentCard  => {
      const clientNameVar = invoice.variableValues?.find(
          (v) => v.variableName === 'client_name'
      );
      
    return {
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      createdAt: invoice.createdAt ?? '',
      previewUrl: invoice.previewUrl ?? null,
      pdfUrl: invoice.pdfUrl ?? null,
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

async function fetchInvoiceTemplates() {
  await invoiceTemplateStore.fetchAllTemplates();

  const list: { id: string; name: string }[] = [];

  list.push(
    ...invoiceTemplateStore.templates
      .filter(t => !!t.id)
      .map(t => ({
        id: t.id as string,
        name: t.name,
      }))
  );
  return list;
}

const fetchAllInvoices = async () => {
  await invoiceStore.fetchAllInvoices();
};

const handleTemplateSelected = (templateId: string) => {
  showTemplateModal.value = false;

  router.push({ 
    name: 'InvoiceForm', 
    query: { templateId }   
  });
};

const editInvoice = (id: string) => {
  router.push({ name: 'InvoiceEdit', params: { id } });
};

function openDeleteConfirmation(id: string) {
  selectedInvoiceId.value = id;
  isDeleteModalOpen.value = true;
}

async function confirmDeleteInvoice() {
  if (!selectedInvoiceId.value) return;
  await invoiceStore.deleteInvoice(selectedInvoiceId.value);
  await fetchAllInvoices();
  showToast('success', 'La facture a été bien supprimée !');
  selectedInvoiceId.value = null;
}

async function fetchInvoices() {
  const term = search.value.trim();
  const status = selectedStatus.value || undefined;
  const start = startDate.value || null;
  const end = endDate.value || null;

  if (!term && !status && !start && !end) {
    await fetchAllInvoices();
  } else {
    await invoiceStore.searchInvoices(term, status, start, end);
  }
}

async function handlePageChange(page: number) {
  await invoiceStore.searchInvoices(
    search.value,
    selectedStatus.value,
    startDate.value,
    endDate.value,
    page
  );
}

onMounted(async () => {
  const status = history.state?.toastStatus as ToastStatus;
  const message = history.state?.toastMessage as string;

  if (message && status) {
    showToast(status, message);
  }

  await invoiceStore.searchInvoices('', null, null, null, 1);
});

async function exportInvoicesAsCSV() {
  try {
    await invoiceStore.exportInvoices(
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

watch([search, selectedStatus, startDate, endDate], async () => {
  await invoiceStore.searchInvoices(
    search.value,
    selectedStatus.value,
    startDate.value,
    endDate.value,
    1
  );
});

</script>
