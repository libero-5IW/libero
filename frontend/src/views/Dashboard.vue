<template>
  <v-container fluid class="flex h-[calc(100vh-64px)] w-[calc(100vw-256px)] max-w-full">
    <div class="grid h-full w-full gap-3 grid-cols-12 auto-rows-fr auto-flow-dense">
      <v-card class="card">
        <RevenueSummaryCard/> 
        <ClientsStatsCard />
      </v-card>
      <v-card class="card">
        <RevenueChart />
      </v-card>
      <router-link :to="{ name: 'InvoiceList' }" class="no-underline">
        <v-card class="card clickable-card">
          <InvoiceStatsCard />
        </v-card>
      </router-link>

      <router-link :to="{ name: 'QuoteList' }" class="no-underline">
        <v-card class="card clickable-card">
          <QuoteStatsCard />
        </v-card>
      </router-link>

      

      

    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { computed, onMounted } from 'vue';
import InvoiceStatsCard from '@/components/Dashboard/InvoiceStatsCard.vue';
import QuoteStatsCard from '@/components/Dashboard/QuoteStatsCard.vue';
import RevenueChart from '@/components/Dashboard/RevenueChart.vue';
import RevenueSummaryCard from '@/components/Dashboard/RevenueSummaryCard.vue';
import ClientsStatsCard from '@/components/Dashboard/ClientsStatsCard.vue';


const userStore = useUserStore();
const authStore = useAuthStore();
const user = computed(() => userStore.user);

onMounted(() => {
  userStore.fetchCurrentUser();
});
</script>

<style scoped>
.dashboard-container {
  height: calc(100vh - 64px);
  width: calc(100vw - 256px);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
  height: auto;
}

.card {
  display: flex;
  flex-direction: column;
  padding: 12px;
  width: 100%;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.no-underline {
  text-decoration: none;
  color: inherit;
}

.clickable-card {
  cursor: pointer;
}

@media (max-width: 1200px) {
  .dashboard-container {
    width: calc(100vw - 200px);
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    width: 100vw;
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
