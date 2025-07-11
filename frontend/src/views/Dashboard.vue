<template>
  <div class="flex h-[calc(100vh-64px)] w-[calc(100vw-256px)] max-w-full">
    <div
      class="grid h-full w-full gap-3 grid-cols-12 auto-rows-fr auto-flow-dense
        xl:w-[calc(100vw-256px)]
        lg:w-[calc(100vw-200px)] lg:grid-cols-8
        md:w-full md:grid-cols-4"
    >
      <div class="flex flex-col p-3 w-full h-full bg-white rounded-lg shadow-sm overflow-hidden col-span-3 row-span-1 lg:col-span-2 md:col-span-4">
        <div class="font-semibold text-lg p-3">Card 1</div>
      </div>
      <div class="flex flex-col p-3 w-full h-full bg-white rounded-lg shadow-sm overflow-hidden col-span-3 row-span-2 lg:col-span-2 md:col-span-4">
        <div class="font-semibold text-lg">Card 2</div>
      </div>
      <div class="flex flex-col p-3 w-full h-full bg-white rounded-lg shadow-sm overflow-hidden col-span-6 row-span-2 lg:col-span-4 md:col-span-4">
        <div class="font-semibold text-lg">Card 3</div>
      </div>
      <div class="flex flex-col p-3 w-full h-full bg-white rounded-lg shadow-sm overflow-hidden col-span-3 row-span-1 lg:col-span-2 md:col-span-4">
        <div class="font-semibold text-lg">Card 4</div>
      </div>
      <div class="flex flex-col p-3 w-full h-full bg-white rounded-lg shadow-sm overflow-hidden col-span-6 row-span-2 lg:col-span-4 md:col-span-4">
        <div class="font-semibold text-lg">Card 5</div>
      </div>
      <div class="flex flex-col p-3 w-full h-full bg-white rounded-lg shadow-sm overflow-hidden col-span-3 row-span-2 lg:col-span-2 md:col-span-4">
        <div class="font-semibold text-lg">Card 6</div>
      </div>
      <div class="flex flex-col p-3 w-full h-full bg-white rounded-lg shadow-sm overflow-hidden col-span-3 row-span-2 lg:col-span-2 md:col-span-4">
        <div class="font-semibold text-lg">Card 7</div>
      </div>
    </div>
  </div>
</template>



<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { computed, onMounted } from 'vue';

const userStore = useUserStore()
const authStore = useAuthStore()
const user = computed(() => userStore.user)

onMounted(() => {
  userStore.fetchCurrentUser()
})
</script>