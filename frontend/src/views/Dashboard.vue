<template>
  <div
   class="flex flex-col"
  >
    <div
        class="flex-grow grid grid-cols-2 gap-3 w-full px-8 auto-rows-auto max-[1200px]:grid-cols-1 max-[768px]:grid-cols-1"
    >
      <div
        class="flex flex-col h-full p-3 gap-y-4 w-full bg-white rounded-md shadow transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      >
        <div class="flex-[] flex flex-col overflow-hidden">
          <RevenueSummaryCard
            :invoices="invoiceStore.invoices"
            :clients="clientStore.clients"
            :contracts="contractStore.contracts"
            :quotes="quoteStore.quotes"
          />
        </div>

        <div class="flex-[1] flex mt-6 flex-col overflow-hidden">
          <ClientsStatsCard
            :invoices="invoiceStore.invoices"
            :clients="clientStore.clients"
            :onEdit="editClient"
          />
        </div>
      </div>

      <div
        class="flex flex-col p-3 w-full bg-white rounded-md shadow transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      >
        <RevenueChart :invoices="invoiceStore.invoices" />
      </div>

      <router-link :to="{ name: 'InvoiceList' }" class="no-underline text-inherit">
        <div
          class="flex flex-col p-3 w-full bg-white rounded-md shadow transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
        >
          <InvoiceStatsCard :invoices="invoiceStore.invoices" :onEdit="editInvoice" />
        </div>
      </router-link>

      <router-link :to="{ name: 'QuoteList' }" class="no-underline text-inherit">
        <div
          class="flex flex-col p-3 w-full bg-white rounded-md shadow transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
        >
          <QuoteStatsCard :quotes="quoteStore.quotes" :onEdit="editQuote" />
        </div>
      </router-link>
    </div>
  </div>
</template>


<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { useInvoiceStore } from '@/stores/invoice';
import { useContractStore } from '@/stores/contract';
import { useClientStore } from '@/stores/client';
import { useQuoteStore } from '@/stores/quote';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import InvoiceStatsCard from '@/components/Dashboard/InvoiceStatsCard.vue';
import QuoteStatsCard from '@/components/Dashboard/QuoteStatsCard.vue';
import RevenueChart from '@/components/Dashboard/RevenueChart.vue';
import RevenueSummaryCard from '@/components/Dashboard/RevenueSummaryCard.vue';
import ClientsStatsCard from '@/components/Dashboard/ClientsStatsCard.vue';

const userStore = useUserStore();
const authStore = useAuthStore();
const invoiceStore = useInvoiceStore();
const clientStore = useClientStore();
const quoteStore = useQuoteStore();
const contractStore = useContractStore();
const router = useRouter();

const user = computed(() => userStore.user);

onMounted(async () => {
  userStore.fetchCurrentUser();
  if (invoiceStore.invoices.length === 0) {
    await invoiceStore.fetchAllInvoices();
  }
  if (clientStore.clients.length === 0) {
    await clientStore.fetchAllClients();
  }
  if (quoteStore.quotes.length === 0) {
    await quoteStore.fetchAllQuotes();
  }
});

function editInvoice(id: string) {
  router.push({ name: 'InvoiceEdit', params: { id } });
}

function editClient(id: string) {
  router.push({ name: 'ClientEdit', params: { id } });
}
function editQuote(id: string) {
  router.push({ name: 'QuoteEdit', params: { id } });
}

</script>