<template>
  <v-card class="pa-4 d-flex flex-column justify-center align-center">
    <v-card-title class="text-h6">Top clients par chiffre d'affaires</v-card-title>
    <v-divider class="my-2" />

    <div v-if="topClients.length > 0" class="w-100">
      <v-table dense class="text-xs">
        <thead>
          <tr>
            <th class="text-left">Client</th>
            <th class="text-left">Total facturé</th>
            <th class="text-left">Nombre de factures</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="client in topClients"
            :key="client.clientId"
            class="hover:bg-gray-50 cursor-pointer"
            @click="onEdit(client.clientId)"
          >
            <td>{{ client.clientName }}</td>
            <td>{{ formatCurrency(client.totalAmount) }}</td>
            <td>{{ client.invoiceCount }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <div v-else class="text-gray-500 text-sm mt-4">
      Pas encore de données disponibles pour cette année.
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { INVOICE_STATUS } from '@/constants/status/invoice-status.constant';
import type { Invoice } from '@/schemas/invoice.schema';
import type { Client } from '@/schemas/client.schema';

const props = defineProps<{
  invoices: Invoice[];
  clients: Client[];
  onEdit: (clientId: string) => void;
}>();

const currentYear = new Date().getFullYear();

const topClients = computed(() => {
  const clientMap: Record<string, { clientId: string; clientName: string; totalAmount: number; invoiceCount: number }> = {};

  props.invoices.forEach(inv => {
    if (
      inv.status === INVOICE_STATUS.PAID &&
      inv.clientId &&
      new Date(inv.dueDate).getFullYear() === currentYear
    ) {
      const clientId = inv.clientId;
      const client = props.clients.find(c => c.id === clientId);
      const clientName = client ? `${client.firstName} ${client.lastName}` : 'Client inconnu';

      const amountVar = inv.variableValues.find(v =>
        ['amount', 'total_amount', 'montant', 'total_ht', 'total_ttc'].includes(
          v.variableName.toLowerCase()
        )
      );
      const amount = amountVar ? parseFloat(amountVar.value) || 0 : 0;

      if (!clientMap[clientId]) {
        clientMap[clientId] = {
          clientId,
          clientName,
          totalAmount: 0,
          invoiceCount: 0,
        };
      }

      clientMap[clientId].totalAmount += amount;
      clientMap[clientId].invoiceCount += 1;
    }
  });

  return Object.values(clientMap)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 3);
});

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}
</script>

<style scoped>
.v-table {
  max-height: 200px;
  overflow-y: auto;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
