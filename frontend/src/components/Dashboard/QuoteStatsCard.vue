<template>
  <v-card class="pa-4 d-flex flex-column justify-center align-center">
    <v-card-title class="text-h6">Résumé des devis</v-card-title>
    <v-divider class="my-2" />

    <div class="d-flex justify-space-around w-100 mb-4">
      <div class="d-flex flex-column align-center">
        <span class="text-h4 font-bold text-blue-600">{{ sentCount }}</span>
        <span class="text-sm text-gray-600">Envoyés</span>
      </div>
      <div class="d-flex flex-column align-center">
        <span class="text-h4 font-bold text-green-600">{{ acceptedCount }}</span>
        <span class="text-sm text-gray-600">Acceptés</span>
      </div>
      <div class="d-flex flex-column align-center">
        <span class="text-h4 font-bold text-red-600">{{ refusedCount }}</span>
        <span class="text-sm text-gray-600">Refusés</span>
      </div>
    </div>

    <v-divider class="my-2" />

    <div class="w-100">
      <h3 class="text-sm font-semibold mb-2">5 derniers devis créés</h3>
      <v-table dense class="text-xs">
        <thead>
          <tr>
            <th class="text-left">Numéro</th>
            <th class="text-left">Client</th>
            <th class="text-left">Statut</th>
            <th class="text-left">Créé le</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!lastFiveQuotes.length">
              <td colspan="4" class="py-6 text-center text-sm text-gray-500">
              Aucun devis récent.
            </td>
          </tr>
          <tr
            v-else
            v-for="quote in lastFiveQuotes"
            :key="quote.id"
            class="hover:bg-gray-50"
            @click="onEdit(quote.id)"
          >
            <td class="py-6">#{{ quote.number }}</td>
            <td>{{ quote.clientName }}</td>
            <td>
              <v-chip
                :color="statusColor(quote.status)"
                size="x-small"
                variant="flat"
                class="text-white"
              >
                {{ statusLabel(quote.status) }}
              </v-chip>
            </td>
            <td>{{ formatDate(quote.createdAt) }}</td>
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
import type { Quote } from '@/schemas/quote.schema';

const props = defineProps<{
  quotes: Quote[];
  onEdit: (id: string) => void;
}>();

const sentCount = computed(() =>
  props.quotes.filter(quote => quote.status === 'sent').length
);

const acceptedCount = computed(() =>
  props.quotes.filter(quote => quote.status === 'accepted').length
);

const refusedCount = computed(() =>
  props.quotes.filter(quote => quote.status === 'refused').length
);

const lastFiveQuotes = computed(() => {
  return [...props.quotes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(quote => {
      const clientNameVar = quote.variableValues?.find(
        v => v.variableName === 'client_name'
      );
      return {
        id: quote.id,
        number: quote.number,
        status: quote.status,
        createdAt: quote.createdAt,
        clientName: clientNameVar?.value || 'Client inconnu',
      };
    });
});

function statusLabel(status: string) {
  switch (status) {
    case 'draft':
      return 'Brouillon';
    case 'sent':
      return 'Envoyé';
    case 'accepted':
      return 'Accepté';
    case 'refused':
      return 'Refusé';
    default:
      return status;
  }
}

function statusColor(status: string) {
  switch (status) {
    case 'draft':
      return 'grey';
    case 'sent':
      return 'blue';
    case 'accepted':
      return 'green';
    case 'refused':
      return 'red';
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
