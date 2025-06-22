<template>
  <DataTable
    :headers="headers"
    :items="quotes"
    :items-length="quotes.length"
    @update:options="fetchAllQuotes"
  >
    <template #top.title>
      <span class="text-xl font-semibold">Liste des devis</span>
    </template>

    <template #top.actions>
      <v-btn color="primary" @click="showTemplateModal = true">
        <v-icon start>mdi-plus</v-icon>
        Nouveau devis
      </v-btn>
    </template>

    <template #item.actions="{ item }">
      <v-btn icon @click="viewQuote(item.id)">
        <v-icon>mdi-eye</v-icon>
      </v-btn>
    </template>
  </DataTable>

  <TemplateSelectionModal 
    v-model="showTemplateModal"
    :fetchTemplates="fetchQuoteTemplates"
    @templateSelected="handleTemplateSelected"
  />
</template>

<script setup lang="ts">

import { ref, computed, onMounted } from 'vue';
import { useQuoteStore } from '@/stores/quote';
import DataTable from '@/components/Table/DataTable.vue';
import TemplateSelectionModal from '@/components/Modals/TemplateSelectionModal.vue'; 
import { useToastHandler } from '@/composables/useToastHandler';
import type { ToastStatus } from '@/types';
import type { Header } from '@/types/Header';
import { useRouter } from 'vue-router';
import { useQuoteTemplateStore } from '@/stores/quoteTemplate';

const quoteTemplateStore = useQuoteTemplateStore();
const quoteStore = useQuoteStore();

const { showToast } = useToastHandler();
const router = useRouter();

const showTemplateModal = ref(false);  
const quotes = computed(() => quoteStore.quotes);

const headers: Header[] = [
  { title: 'Numéro', value: 'number', sortable: true },
  { title: 'Statut', value: 'status', sortable: true },
  { title: 'Date d\'émission', value: 'issuedAt', sortable: true },
  { title: 'Actions', value: 'actions', sortable: false },
];

async function fetchQuoteTemplates() {
  await quoteTemplateStore.fetchAllTemplates();

  const list: { id: string; name: string }[] = [];

  list.push(
    ...quoteTemplateStore.templates
      .filter(t => !!t.id)
      .map(t => ({
        id: t.id as string,
        name: t.name,
      }))
  );

  return list;
}

const fetchAllQuotes = async () => {
  await quoteStore.fetchAllQuotes();
};

const viewQuote = (id: string) => {
  console.log(`Visualiser devis ${id}`);
};

const handleTemplateSelected = (templateId: string) => {
  showTemplateModal.value = false;

  router.push({ 
    name: 'QuoteForm', 
    query: { templateId }   
  });
};

onMounted(async () => {
  const status = history.state?.toastStatus as ToastStatus;
  const message = history.state?.toastMessage as string;

  if (message && status) {
    showToast(status, message);
  }

  await fetchAllQuotes();
});

</script>
