<template>
  <div class="ml-4 mt-8">
    <div class="flex items-center justify-between mb-10">
      <h1 class="text-xl font-bold">Liste des contrats</h1>
      <v-btn color="primary" @click="showTemplateModal = true">
        <v-icon start>mdi-plus</v-icon>
        Nouveau contrat
      </v-btn>
    </div>

    <div class="flex items-center gap-4 mb-6">
      <SearchInput
        v-model="search"
        placeholder="Rechercher un contrat"
        @search="fetchContracts"
      />

      <v-select
        v-model="selectedStatus"
        :items="statusOptions"
        item-title="label"
        item-value="value"
        label="Filtrer par statut"
        class="w-64"
        clearable
        @update:modelValue="fetchContracts"
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
        titlePrefix="Contrat"
        type="contract"
        @edit="editContract"
        @change-status="openStatusModal"
        @sent-to-client="openSentConfirmation"
        @delete="openDeleteConfirmation"
        @convert-to-invoice="handleConvertToInvoice"
        :isLoading="isLoading"
      />
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center text-gray-500 text-lg h-[60vh]"
    >
      <v-icon size="48" class="mb-4" color="grey">mdi-file-document-outline</v-icon>
      <p>Aucun contrat créé pour le moment.</p>
    </div>


  </div>

  <TemplateSelectionModal 
    v-model="showTemplateModal"
    :fetchTemplates="fetchContractTemplates"
    type="contrat"
    @templateSelected="handleTemplateSelected"
  />

  <ConfirmationModal
  v-model="isEmailSentModalOpen"
  title="Confirmation d'envoi d'email pour signature"
  message="Souhaitez-vous envoyer ce contrat pour signature via DocuSign ? Le statut du contrat restera ou sera changé à Envoyé."
  confirmText="Envoyer"
  cancelText="Annuler"
  confirmColor="success"
  @confirm="confirmSignatureContract"
  />


  <StatusChangingModal
  v-model="isStatusModalOpen"
  :current-status="selectedContractStatus"
  :available-statuses="statusModalAvailableStatuses"
  @change="updateContractStatus"
  />

  <ConfirmationModal
    v-model="isDeleteModalOpen"
    title="Confirmation de suppression"
    message="Êtes-vous sûr de vouloir supprimer ce contrat ? Cette action est irréversible."
    confirmText="Supprimer"
    cancelText="Annuler"
    confirmColor="error"
    @confirm="confirmDeleteContract"
  />

  <TemplateSelectionModal
  v-model="showInvoiceTemplateModal"
  :fetchTemplates="fetchInvoiceTemplates"
  type="contrat"
  @templateSelected="handleInvoiceTemplateSelected"
  />

</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useContractStore } from '@/stores/contract';
import { useContractTemplateStore } from '@/stores/contractTemplate';
import DocumentCardList from '@/components/DocumentDisplay/DocumentCardList.vue';
import TemplateSelectionModal from '@/components/Modals/TemplateSelectionModal.vue';
import { useToastHandler } from '@/composables/useToastHandler';
import type { DocumentCard, ToastStatus } from '@/types';
import type { Header } from '@/types/Header';
import ConfirmationModal from '@/components/Modals/ConfirmationModal.vue'
import { useInvoiceTemplateStore } from '@/stores/invoiceTemplate';
import { mapContractToInvoiceVariables } from '@/utils/mapContractToInvoice';
import type { Contract } from '@/schemas/contract.schema';
import SearchInput from '@/components/SearchInput.vue';
import { CONTRACT_STATUS } from '@/constants/status/contract-status.constant';
import StatusChangingModal from '@/components/Modals/StatusChangingModal.vue';

const search = ref('');
const router = useRouter();
const contractStore = useContractStore();
const contractTemplateStore = useContractTemplateStore();
const { showToast } = useToastHandler();

const showTemplateModal = ref(false);
const contracts = computed(() => contractStore.contracts);
const selectedStatus = ref<string | null>(null);
const isLoading = computed(() => contractStore.isLoading)

const isEmailSentModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isStatusModalOpen = ref(false)
const selectedContractStatus = ref<string>('draft');
const statusModalAvailableStatuses = ref<{ value: string; label: string; description?: string }[]>([]);

const selectedContractId = ref<string | null>(null)
const invoiceTemplateStore = useInvoiceTemplateStore();
const showInvoiceTemplateModal = ref(false);
const contractToConvert = ref<Contract | null>(null);

const statusOptions = [
  { label: 'Tous', value: null },
  { label: 'Brouillon', value: CONTRACT_STATUS.DRAFT },
  { label: 'Envoyé pour signature', value: CONTRACT_STATUS.AWAITING_SIGNATURE },
  { label: 'Signé', value: CONTRACT_STATUS.SIGNED },
  { label: 'Expiré', value: CONTRACT_STATUS.EXPIRED },
  { label: 'Annulé', value: CONTRACT_STATUS.CANCELLED },
];

const documentCards = computed<DocumentCard[]>(() =>
  contracts.value.map((contract): DocumentCard  => {
      const clientNameVar = contract.variableValues?.find(
          (v) => v.variableName === 'client_name'
      );
      
    return {
      id: contract.id,
      number: contract.number,
      status: contract.status,
      createdAt: contract.createdAt ?? '',
      previewUrl: contract.previewUrl ?? null,
      pdfUrl: contract.pdfUrl ?? null,
      clientName: clientNameVar?.value || 'Client inconnu',
      clientId: contract.clientId
    }
  })
);

const allStatuses = [
  { value: CONTRACT_STATUS.AWAITING_SIGNATURE, label: 'Envoyé pour signature', description: 'Pas d\'email avec modification manuelle' },
  { value: CONTRACT_STATUS.CANCELLED, label: 'Annulé', description: 'Contrat annulé par le prestataire' },
  { value: CONTRACT_STATUS.DECLINED, label: 'Refusé', description: 'Contrat refusé par le client' },
  { value: CONTRACT_STATUS.SIGNED, label: 'Signé', description: 'Contrat signé par les deux parties' },
];

function getAvailableStatuses(currentStatus: string) {
  switch (currentStatus) {
    case CONTRACT_STATUS.DRAFT:
      return [allStatuses[0]]; // sent
    case CONTRACT_STATUS.AWAITING_SIGNATURE:
      return [allStatuses[1], allStatuses[2], allStatuses[3]]; // cancelled, declined, signed
    default:
      return [];
  }
}

async function updateContractStatus(newStatus: string) {
  if (!selectedContractId.value) return;
  const contract = await contractStore.changeStatus(selectedContractId.value, newStatus);
  isStatusModalOpen.value = false;
  if (contract) {
    await fetchAllContracts();
    showToast('success', `Statut mis à jour avec succès pour le devis ${contract?.number} !`);
  }
  selectedContractId.value = null;
}

async function fetchContractTemplates() {
  await contractTemplateStore.fetchAllTemplates();
  return contractTemplateStore.templates
    .filter(t => !!t.id)
    .map(t => ({
      id: t.id as string,
      name: t.name,
    }));
}

async function confirmSignatureContract() {
  if (!selectedContractId.value) return;
  const client = await contractStore.sendContractForSignature(selectedContractId.value);
  if (client) {
    await fetchAllContracts();
    showToast('success', `Le contrat a bien été envoyé à ${client.firstName} ${client.lastName.toUpperCase()} pour signature !`);
  }
  selectedContractId.value = null;
}

async function fetchAllContracts() {
  await contractStore.fetchAllContracts();
}

function editContract(id: string) {
  router.push({ name: 'ContractEdit', params: { id } });
}

function handleTemplateSelected(templateId: string) {
  showTemplateModal.value = false;
  router.push({ 
    name: 'ContractForm', 
    query: { templateId }   
  });
}

function openDeleteConfirmation(id: string) {
  selectedContractId.value = id
  isDeleteModalOpen.value = true
}

function openSentConfirmation(id: string) {
  selectedContractId.value = id;
  isEmailSentModalOpen.value = true;
}
function openStatusModal(id: string) {
  const quote = contractStore.contracts.find(q => q.id === id);
  if (!quote) return;
  selectedContractId.value = id;
  selectedContractStatus.value = quote.status;
  statusModalAvailableStatuses.value = getAvailableStatuses(quote.status);
  isStatusModalOpen.value = true;
}

async function confirmDeleteContract() {
  if (!selectedContractId.value) return
  await contractStore.deleteContract(selectedContractId.value)
  await fetchAllContracts()
  showToast('success', 'Le contrat a été bien supprimé !')
  selectedContractId.value = null
}

function handleConvertToInvoice(card: DocumentCard) {
  const contract = contracts.value.find(c => c.id === card.id);

  if (!contract) {
    showToast('error', 'Contrat introuvable');
    return;
  }

  contractToConvert.value = contract;
  showInvoiceTemplateModal.value = true;
}

async function fetchInvoiceTemplates() {
  await invoiceTemplateStore.fetchAllTemplates();
  return invoiceTemplateStore.templates.map(t => ({
    id: t.id!,
    name: t.name,
  }));
}

function handleInvoiceTemplateSelected(templateId: string) {
  const contract = contractToConvert.value;
  const template = invoiceTemplateStore.templates.find(t => t.id === templateId);

  if (!contract || !template) {
    showToast('error', 'Erreur lors de la génération de la facture');
    return;
  }

  const mappedVars = mapContractToInvoiceVariables(template.variables, contract.variableValues);

  router.push({
    name: 'InvoiceForm',
    state: {
      fromContractId: contract.id,
      templateId,
      clientId: contract.clientId,
      variables: mappedVars,
    }
  });
}

async function fetchContracts() {
  const term = search.value.trim();
  const status = selectedStatus.value || undefined;

  if (!term && !status) {
    await contractStore.fetchAllContracts();
  } else {
    await contractStore.searchContracts(term, status);
  }
}

onMounted(async () => {
  const status = history.state?.toastStatus as ToastStatus;
  const message = history.state?.toastMessage as string;

  if (message && status) {
    showToast(status, message);
  }

  await fetchAllContracts();
});

watch([search, selectedStatus], async () => {
  await fetchContracts();
});

</script>
