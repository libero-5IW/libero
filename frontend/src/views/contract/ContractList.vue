<template>
  <div class="ml-4 mt-8">
    <div class="flex items-center justify-between mb-10">
      <h1 class="text-xl font-bold">Liste des contrats</h1>
      <v-btn color="primary" @click="showTemplateModal = true">
        <v-icon start>mdi-plus</v-icon>
        Nouveau contrat
      </v-btn>
    </div>

    <div v-if="documentCards.length > 0">
      <DocumentCardList
        :items="documentCards"
        titlePrefix="Contrat"
        @edit="editContract"
        @change-status="showStatusModal = true"
        @delete="openDeleteConfirmation"
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
    @templateSelected="handleTemplateSelected"
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useContractStore } from '@/stores/contract';
import { useContractTemplateStore } from '@/stores/contractTemplate';
import DocumentCardList from '@/components/DocumentDisplay/DocumentCardList.vue';
import TemplateSelectionModal from '@/components/Modals/TemplateSelectionModal.vue';
import { useToastHandler } from '@/composables/useToastHandler';
import type { DocumentCard, ToastStatus } from '@/types';
import type { Header } from '@/types/Header';
import ConfirmationModal from '@/components/Modals/ConfirmationModal.vue'

const router = useRouter();
const contractStore = useContractStore();
const contractTemplateStore = useContractTemplateStore();
const { showToast } = useToastHandler();

const showTemplateModal = ref(false);
const showStatusModal = ref(false);  
const contracts = computed(() => contractStore.contracts);

const isDeleteModalOpen = ref(false)
const selectedContractId = ref<string | null>(null)

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

async function fetchContractTemplates() {
  await contractTemplateStore.fetchAllTemplates();
  return contractTemplateStore.templates
    .filter(t => !!t.id)
    .map(t => ({
      id: t.id as string,
      name: t.name,
    }));
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

async function confirmDeleteContract() {
  if (!selectedContractId.value) return
  await contractStore.deleteContract(selectedContractId.value)
  await fetchAllContracts()
  showToast('success', 'Le contrat a été bien supprimé !')
  selectedContractId.value = null
}

onMounted(async () => {
  const status = history.state?.toastStatus as ToastStatus;
  const message = history.state?.toastMessage as string;

  if (message && status) {
    showToast(status, message);
  }

  await fetchAllContracts();
});
</script>
