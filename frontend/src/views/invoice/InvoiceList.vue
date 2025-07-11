<template>
  <div class="ml-4 mt-8">
    <div class="flex items-center justify-between mb-10">
      <h1 class="text-xl font-bold">Liste des factures</h1>
      <v-btn color="primary" @click="showTemplateModal = true">
        <v-icon start>mdi-plus</v-icon>
        Nouveau facture
      </v-btn>
    </div>

    <div class="flex items-center gap-4 mb-6">
      <SearchInput
        v-model="search"
        placeholder="Rechercher une facture"
        @search="fetchInvoices"
      />

      <v-select
        v-model="selectedStatus"
        :items="statusOptions"
        item-title="label"
        item-value="value"
        label="Filtrer par statut"
        class="w-64"
        clearable
        @update:modelValue="fetchInvoices"
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
        titlePrefix="Facture"
        type="invoice"
        @edit="editInvoice"
        @change-status="openStatusModal"
        @sent-to-client="openSentConfirmation"
        @sent-paid-to-client="openSentPaidConfirmation"
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
  v-model="isEmailSentModalOpen"
  title="Confirmation d'envoi d'email"
  message="Souhaitez-vous envoyer par email cette facture au client ? Le statut de la facture restera ou sera changé à Envoyé."
  confirmText="Envoyer"
  cancelText="Annuler"
  confirmColor="success"
  @confirm="confirmSentInvoice"
  />

  <ConfirmationModal
  v-model="isEmailSentPaidModalOpen"
  title="Confirmation d'envoi d'email"
  message="Souhaitez-vous envoyer cette facture marquée comme payée au client ? Un e-mail de confirmation avec la facture acquittée sera envoyé."
  confirmText="Envoyer"
  cancelText="Annuler"
  confirmColor="success"
  @confirm="confirmSentPaidInvoice"
  />

  <StatusChangingModal
  v-model="isStatusModalOpen"
  :current-status="selectedInvoiceStatus"
  :available-statuses="statusModalAvailableStatuses"
  @change="updateInvoiceStatus"
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
</template>

<script setup lang="ts">

import { ref, computed, onMounted, watch } from 'vue';
import { useInvoiceStore } from '@/stores/invoice';
import DocumentCardList from '@/components/DocumentDisplay/DocumentCardList.vue';
import TemplateSelectionModal from '@/components/Modals/TemplateSelectionModal.vue'; 
import { useToastHandler } from '@/composables/useToastHandler';
import type { DocumentCard, ToastStatus } from '@/types';
import { useRouter } from 'vue-router';
import { useInvoiceTemplateStore } from '@/stores/invoiceTemplate';
import ConfirmationModal from '@/components/Modals/ConfirmationModal.vue';
import SearchInput from '@/components/SearchInput.vue';
import { INVOICE_STATUS } from '@/constants/status/invoice-status.constant';
import StatusChangingModal from '@/components/Modals/StatusChangingModal.vue';

const search = ref('');
const invoiceTemplateStore = useInvoiceTemplateStore();
const invoiceStore = useInvoiceStore();
const selectedStatus = ref<string | null>(null);

const { showToast } = useToastHandler();
const router = useRouter();

const showTemplateModal = ref(false);  
const invoices = computed(() => invoiceStore.invoices);
const isLoading = computed(() => invoiceStore.isLoading)

const isDeleteModalOpen = ref(false);
const selectedInvoiceId = ref<string | null>(null);
const isEmailSentModalOpen = ref(false);
const isEmailSentPaidModalOpen = ref(false);

const isStatusModalOpen = ref(false)
const selectedInvoiceStatus = ref<string>('draft');
const statusModalAvailableStatuses = ref<{ value: string; label: string; description?: string }[]>([]);

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
      clientName: clientNameVar?.value || 'Client inconnu',
      clientId: invoice.clientId
    }
  })
);

const allStatuses = [
  { value: INVOICE_STATUS.SENT, label: 'Envoyée', description: 'Pas d\'email avec modification manuelle' },
  { value: INVOICE_STATUS.PAID, label: 'Payée', description: 'La facture sera modifié avec une mention acquittée' },
  { value: INVOICE_STATUS.CANCELLED, label: 'Annulée', description: 'Facture annulée par le freelance (vous)' },
  { value: INVOICE_STATUS.OVERDUE, label: 'En retard' },

];

function getAvailableStatuses(currentStatus: string) {
  switch (currentStatus) {
    case INVOICE_STATUS.DRAFT:
      return [allStatuses[0]]; // sent
    case INVOICE_STATUS.SENT:
      return [allStatuses[1], allStatuses[2]]; // paid, cancelled
    case INVOICE_STATUS.OVERDUE:
      return [allStatuses[1], allStatuses[2]]; // paid, cancelled
    default:
      return [];
  }
}

async function updateInvoiceStatus(newStatus: string) {
  if (!selectedInvoiceId.value) return;
  const invoice = await invoiceStore.changeStatus(selectedInvoiceId.value, newStatus);
  isStatusModalOpen.value = false;
  if(invoice) {
    await fetchAllInvoices();
    showToast('success', `Statut mis à jour avec succès pour la facture ${invoice?.number} !`);
  }
  selectedInvoiceId.value = null;
}

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

function openSentConfirmation(id: string) {
  selectedInvoiceId.value = id;
  isEmailSentModalOpen.value = true;
}

function openSentPaidConfirmation(id: string) {
  selectedInvoiceId.value = id;
  isEmailSentPaidModalOpen.value = true;
}

function openStatusModal(id: string) {
  const invoice = invoiceStore.invoices.find(q => q.id === id);
  if (!invoice) return;
  selectedInvoiceId.value = id;
  selectedInvoiceStatus.value = invoice.status;
  statusModalAvailableStatuses.value = getAvailableStatuses(invoice.status);
  isStatusModalOpen.value = true;
}

async function confirmDeleteInvoice() {
  if (!selectedInvoiceId.value) return;
  await invoiceStore.deleteInvoice(selectedInvoiceId.value);
  await fetchAllInvoices();
  showToast('success', 'La facture a été bien supprimée !');
  selectedInvoiceId.value = null;
}

async function confirmSentInvoice() {
  if (!selectedInvoiceId.value) return;
  const client = await invoiceStore.sentInvoiceToClient(selectedInvoiceId.value);
  if (client) {
    await fetchAllInvoices();
    showToast('success', `La facture a bien été envoyée à ${client.firstName} ${client.lastName.toUpperCase()}!`);
  }
  selectedInvoiceId.value = null;
}

async function confirmSentPaidInvoice() {
  if (!selectedInvoiceId.value) return;
  const client = await invoiceStore.sentPaidInvoiceToClient(selectedInvoiceId.value);
  if (client) {
    await fetchAllInvoices();
    showToast('success', `La facture acquittée a bien été envoyée à ${client.firstName} ${client.lastName.toUpperCase()}!`);
  }
  selectedInvoiceId.value = null;
}

async function fetchInvoices() {
  const term = search.value.trim();
  const status = selectedStatus.value || undefined;

  if (!term && !status) {
    await fetchAllInvoices();
  } else {
    await invoiceStore.searchInvoices(term, status);
  }
}

onMounted(async () => {
  const status = history.state?.toastStatus as ToastStatus;
  const message = history.state?.toastMessage as string;

  if (message && status) {
    showToast(status, message);
  }

  await fetchAllInvoices();
});

watch([search, selectedStatus], async () => {
  await fetchInvoices();
});

</script>
