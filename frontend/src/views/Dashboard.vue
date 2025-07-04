<template>
  <v-container fluid class="flex h-[calc(100vh-64px)] w-[calc(100vw-256px)] max-w-full">
    <div class="grid h-full w-full gap-3 grid-cols-12 auto-rows-fr auto-flow-dense
        xl:w-[calc(100vw-256px)]
        lg:w-[calc(100vw-200px)] lg:grid-cols-8
        md:w-full md:grid-cols-4">
      <div class="flex flex-col p-3 w-full h-full bg-white rounded-lg shadow-sm overflow-hidden col-span-3 row-span-1 lg:col-span-2 md:col-span-4">
        <InvoiceStatsCard />
      </div>


      <!-- <v-card class="card card-1x2">
        <v-card-title>Card 2</v-card-title>
      </v-card> -->

      <div class="flex flex-col p-3 w-full h-full bg-white rounded-lg shadow-sm overflow-hidden col-span-3 row-span-2 lg:col-span-2 md:col-span-4">
        <RevenueChart/>
      </div>

      <!-- <v-card class="card card-1x1">
        <v-card-title>Card 4</v-card-title>
      </v-card>

      <v-card class="card card-2x2">
        <v-card-title>Card 5</v-card-title>
      </v-card>

      <v-card class="card card-1x2">
        <v-card-title>Card 6</v-card-title>
      </v-card>

      <v-card class="card card-1x2">
        <v-card-title>Card 7</v-card-title>
      </v-card> -->
    </div>
  </div>
</template>



<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { computed, onMounted } from 'vue';
import InvoiceStatsCard from '@/components/Dashboard/InvoiceStatsCard.vue';
import RevenueChart from '@/components/Dashboard/RevenueChart.vue';



const userStore = useUserStore()
const authStore = useAuthStore()
const user = computed(() => userStore.user)

onMounted(() => {
  userStore.fetchCurrentUser()
})
</script>