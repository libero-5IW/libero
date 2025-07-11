<template>
  <div class="flex flex-col h-full p-6 bg-white rounded-md shadow">
    <h2 class="text-lg font-semibold mb-4 text-center">Top clients par chiffre d'affaires</h2>

    <div v-if="topClients.length > 0" class="overflow-y-auto max-h-[200px]">
      <table class="table-auto w-full text-sm text-left">
        <thead>
          <tr class="text-gray-600 font-medium">
            <th class="pb-2">Client</th>
            <th class="pb-2">Total facturé</th>
            <th class="pb-2">Nombre de factures</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="client in topClients"
            :key="client.clientId"
            class="hover:bg-gray-100 cursor-pointer"
            @click="onEdit(client.clientId)"
          >
            <td class="py-1">{{ client.clientName }}</td>
            <td class="py-1">{{ formatCurrency(client.totalAmount) }}</td>
            <td class="py-1">{{ client.invoiceCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-gray-500 text-sm text-center mt-4">
      Pas encore de données disponibles pour cette année.
    </div>
  </div>
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
