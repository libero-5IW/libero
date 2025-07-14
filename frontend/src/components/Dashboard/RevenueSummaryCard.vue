<template>
  <v-card class="pa-4 d-flex flex-column justify-center align-center">
    <v-card-title class="text-h6">Stats</v-card-title>
    <v-divider class="my-2" />

    <v-btn-toggle
      v-model="selectedPeriod"
      color="primary"
      mandatory
      class="mb-4"
      density="compact"
    >
      <v-btn value="month">Ce mois</v-btn>
      <v-btn value="year">Cette année</v-btn>
    </v-btn-toggle>

    <div class="d-flex justify-space-around w-100 mb-4">
      <div class="d-flex flex-column align-center">
        <span class="text-h4 font-bold text-blue-600">{{ revenueFormatted }}</span>
        <span class="text-sm text-gray-600">
          {{ selectedPeriod === 'month' ? "Chiffre d'affaires (mois)" : "Chiffre d'affaires (année)" }}
        </span>
      </div>
    </div>

    <v-divider class="my-2" />

    <div class="d-flex justify-space-around w-100 mb-4">
      <div class="d-flex flex-column align-center">
        <span class="text-h4 font-bold text-purple-600">{{ clientCount }}</span>
        <span class="text-sm text-gray-600">Clients</span>
      </div>
      <div class="d-flex flex-column align-center">
        <span class="text-h4 font-bold text-indigo-600">{{ signedContracts }}</span>
        <span class="text-sm text-gray-600">Contrats signés</span>
      </div>
    </div>

    <v-divider class="my-2" />

    <div class="d-flex justify-space-around w-100">
      <div class="d-flex flex-column align-center">
        <span class="text-h4 font-bold text-orange-600">{{ quoteCount }}</span>
        <span class="text-sm text-gray-600">Devis</span>
      </div>
      <div class="d-flex flex-column align-center">
        <span class="text-h4 font-bold text-teal-600">{{ invoiceCount }}</span>
        <span class="text-sm text-gray-600">Factures</span>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Invoice } from '@/schemas/invoice.schema';
import type { Client } from '@/schemas/client.schema';
import type { Contract } from '@/schemas/contract.schema';
import type { Quote } from '@/schemas/quote.schema';
import { INVOICE_STATUS } from '@/constants/status/invoice-status.constant';

const props = defineProps<{
  invoices: Invoice[];
  clients: Client[];
  contracts: Contract[];
  quotes: Quote[];
}>();

const selectedPeriod = ref<'month' | 'year'>('month');

const revenue = computed(() => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return props.invoices
    .filter(inv => {
      if (inv.status !== INVOICE_STATUS.PAID) return false;
      const date = new Date(inv.dueDate);
      return selectedPeriod.value === 'month'
        ? date.getFullYear() === currentYear && (date.getMonth() - 1) === currentMonth
        : date.getFullYear() === currentYear;
    })
    .reduce((total, inv) => {
      const amountVar = inv.variableValues.find(v =>
        ['amount', 'total_amount', 'montant', 'total_ht', 'total_ttc'].includes(v.variableName.toLowerCase())
      );
      const amount = amountVar ? parseFloat(amountVar.value) || 0 : 0;
      return total + amount;
    }, 0);
});

const revenueFormatted = computed(() =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(revenue.value)
);

const clientCount = computed(() => props.clients.length);

const signedContracts = computed(() =>
  props.contracts.filter(contract => contract.status === 'signed').length
);

const quoteCount = computed(() => props.quotes.length);

const invoiceCount = computed(() => props.invoices.length);
</script>

