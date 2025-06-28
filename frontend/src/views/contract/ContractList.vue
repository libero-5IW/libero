<template>
  <DataTable
    :headers="headers"
    :items="contracts"
    :items-length="contracts.length"
    @update:options="fetchAllContracts"
  >
    <template #top.title>
      <span class="text-xl font-semibold">Liste des contrats</span>
    </template>

    <template #top.actions>
      <v-btn color="primary" @click="showTemplateModal = true">
        <v-icon start>mdi-plus</v-icon>
        Nouveau contrat
      </v-btn>
    </template>

    <template #item.actions="{ item }">
      <v-btn icon @click="viewContract(item.id)">
        <v-icon>mdi-eye</v-icon>
      </v-btn>
      <v-btn icon @click="editContract(item.id)">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn icon color="primary" @click="openDeleteConfirmation(item.id)">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </template>
  </DataTable>

  <TemplateSelectionModal 
    v-model="showTemplateModal"
    :fetchTemplates="fetchContractTemplates"
    @templateSelected="handleTemplateSelected"
  />

  <ConfirmationModal
    v-model="isDeleteModalOpen"
    title="Supprimer ce contrat ?"
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
import DataTable from '@/components/Table/DataTable.vue';
import TemplateSelectionModal from '@/components/Modals/TemplateSelectionModal.vue';
import { useToastHandler } from '@/composables/useToastHandler';
import type { ToastStatus } from '@/types';
import type { Header } from '@/types/Header';
import ConfirmationModal from '@/components/Modals/ConfirmationModal.vue'

const router = useRouter();
const contractStore = useContractStore();
const contractTemplateStore = useContractTemplateStore();
const { showToast } = useToastHandler();

const showTemplateModal = ref(false);
const contracts = computed(() => contractStore.contracts);

const isDeleteModalOpen = ref(false)
const selectedContractId = ref<string | null>(null)

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

function viewContract(id: string) {
  console.log(`Visualiser contrat ${id}`);
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
