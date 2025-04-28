<template>
  <DataTable
    :headers="headers"
    :items="invoices"
    :items-length="invoices.length"
    @update:options="fetchAllInvoices"
  >
    <template #top.title>
      <span class="text-xl font-semibold">Liste des factures</span>
    </template>

    <template #top.actions>
      <v-btn color="primary" @click="showTemplateModal = true">
        <v-icon start>mdi-plus</v-icon>
        Nouvelle facture
      </v-btn>
    </template>

    <template #item.actions="{ item }">
      <v-btn icon @click="viewInvoice(item.id)">
        <v-icon>mdi-eye</v-icon>
      </v-btn>
    </template>
  </DataTable>

  <TemplateSelectionModal 
    v-model="showTemplateModal"
    @templateSelected="handleTemplateSelected"
  />
</template>

<script setup lang="ts">

import { ref, computed, onMounted } from 'vue';
import { useInvoiceStore } from '@/stores/invoice';
import DataTable from '@/components/Table/DataTable.vue';
import TemplateSelectionModal from '@/components/Invoice/TemplateSelectionModal.vue';  // 🔹 Import de la modal
import { useToastHandler } from '@/composables/useToastHandler';
import type { ToastStatus } from '@/types';
import type { Header } from '@/types/Header';
import { useRouter } from 'vue-router';

const invoiceStore = useInvoiceStore();
const { showToast } = useToastHandler();
const router = useRouter();

const showTemplateModal = ref(false);  

const headers: Header[] = [
  { title: 'Numéro', value: 'number', sortable: true },
  { title: 'Statut', value: 'status', sortable: true },
  { title: 'Date d\'émission', value: 'issuedAt', sortable: true },
  { title: 'Actions', value: 'actions', sortable: false },
];

const invoices = computed(() => invoiceStore.invoices);

const fetchAllInvoices = async () => {
  await invoiceStore.fetchAllInvoices();
};

const viewInvoice = (id: string) => {
  console.log(`Visualiser facture ${id}`);
};

const handleTemplateSelected = (templateId: string) => {
  showTemplateModal.value = false;

  router.push({ 
    name: 'InvoiceForm', 
    query: { templateId }   
  });
};

onMounted(async () => {
  const message = sessionStorage.getItem('toastMessage');
  const status = sessionStorage.getItem('toastStatus') as ToastStatus;

  if (message && status) {
    showToast(status, message);
    sessionStorage.removeItem('toastMessage');
    sessionStorage.removeItem('toastStatus');
  }

  await fetchAllInvoices();
});

</script>
