<template>
  <v-card class="pa-4 d-flex flex-column justify-center align-center">
    <v-card-title class="text-h6">Résumé des factures</v-card-title>
    <v-divider class="my-2" />

    <div class="d-flex justify-space-around w-100 mb-4">
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

    <v-divider class="my-2" />
    <div class="w-100">
      <h3 class="text-sm font-semibold mb-2">5 dernières factures créées</h3>
      <v-table dense class="text-xs">
        <thead>
          <tr>
            <th class="text-left">Numéro</th>
            <th class="text-left">Client</th>
            <th class="text-left">Statut</th>
            <th class="text-left">Créée le</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!lastFiveInvoices.length">
              <td colspan="4" class="py-6 text-center text-sm text-gray-500">
              Aucune facture récente.
            </td>
          </tr>
          <tr v-else
            v-for="invoice in lastFiveInvoices"
            :key="invoice.id"
            class="hover:bg-gray-50"
            @click="onEdit(invoice.id)"
          >
            <td class="py-6">#{{ invoice.number }}</td>
            <td>{{ invoice.clientName }}</td>
            <td>
              <v-chip
                :color="statusColor(invoice.status)"
                size="x-small"
                variant="flat"
                class="text-white"
              >
                {{ statusLabel(invoice.status) }}
              </v-chip>
            </td>
            <td>{{ formatDate(invoice.createdAt) }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { INVOICE_STATUS } from '@/constants/status/invoice-status.constant';
import type { Invoice } from '@/schemas/invoice.schema';

const props = defineProps<{
  invoices: Invoice[];
  onEdit: (id: string) => void;
}>();

const sentCount = computed(() =>
  props.invoices.filter(inv => inv.status === INVOICE_STATUS.SENT).length
);

const overdueCount = computed(() =>
  props.invoices.filter(inv => inv.status === INVOICE_STATUS.OVERDUE).length
);

const paidCount = computed(() =>
  props.invoices.filter(inv => inv.status === INVOICE_STATUS.PAID).length
);

const lastFiveInvoices = computed(() => {
  return [...props.invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(inv => {
      const clientNameVar = inv.variableValues?.find(
        v => v.variableName === 'client_name'
      );
      return {
        id: inv.id,
        number: inv.number,
        status: inv.status,
        createdAt: inv.createdAt,
        clientName: clientNameVar?.value || 'Client inconnu',
      };
    });
});

function statusLabel(status: string) {
  switch (status) {
    case INVOICE_STATUS.DRAFT:
      return 'Brouillon';
    case INVOICE_STATUS.SENT:
      return 'Envoyée';
    case INVOICE_STATUS.PAID:
      return 'Payée';
    case INVOICE_STATUS.OVERDUE:
      return 'En retard';
    case INVOICE_STATUS.CANCELLED:
      return 'Annulée';
    default:
      return status;
  }
}

function statusColor(status: string) {
  switch (status) {
    case INVOICE_STATUS.DRAFT:
      return 'grey';
    case INVOICE_STATUS.SENT:
      return 'blue';
    case INVOICE_STATUS.PAID:
      return 'green';
    case INVOICE_STATUS.OVERDUE:
      return 'red';
    case INVOICE_STATUS.CANCELLED:
      return 'grey-darken-1';
    default:
      return 'grey';
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return format(date, 'dd MMM yyyy', { locale: fr });
}
</script>

<style scoped>
.v-table {
  max-height: 200px;
  overflow-y: auto;
}
</style>
