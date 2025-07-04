<template>
  <v-card class="pa-4 d-flex flex-column justify-center align-center">
    <v-card-title class="text-h6">Résumé des factures</v-card-title>
    <v-divider class="my-2" />
    <div class="d-flex justify-space-around w-100">
      <div class="d-flex flex-column align-center">
        <span class="text-h4 font-bold text-blue-600">{{ sentCount }}</span>
        <span class="text-sm text-gray-600">Envoyées</span>
      </div>
      <div class="d-flex flex-column align-center">
        <span class="text-h4 font-bold text-green-600">{{ paidCount }}</span>
        <span class="text-sm text-gray-600">Payées</span>
      </div>
      <div class="d-flex flex-column align-center">
        <span class="text-h4 font-bold text-red-600">{{ overdueCount }}</span>
        <span class="text-sm text-gray-600">En retard</span>
      </div>
      
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useInvoiceStore } from '@/stores/invoice';

const invoiceStore = useInvoiceStore();

onMounted(async () => {
  if (invoiceStore.invoices.length === 0) {
    await invoiceStore.fetchAllInvoices();
  }
});

const sentCount = computed(() => 
  invoiceStore.invoices.filter(inv => inv.status === 'sent').length
);

const overdueCount = computed(() => 
  invoiceStore.invoices.filter(inv => inv.status === 'overdue').length
);

const paidCount = computed(() => 
  invoiceStore.invoices.filter(inv => inv.status === 'paid').length
);
</script>
