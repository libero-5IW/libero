<template>
  <v-card
    class="bg-transparent shadow-none rounded-3xl transition-transform duration-300 hover:scale-[1.02] p-6"
    elevation="0"
  >
    <div class="flex items-start gap-4">
      <div class="flex-shrink-0">
        <div class="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-bold text-base shadow-md">
          {{ number }}
        </div>
      </div>
      <div class="flex-1">
        <div class="flex items-center mb-2">
          <v-icon :icon="icon" size="20" color="secondary" />
          <v-card-title class="text-lg font-semibold text-gray-900 dark:text-white p-0">
            {{ title }}
          </v-card-title>
        </div>
        <v-card-text class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed p-0">
          {{ description }}
        </v-card-text>
      </div>
    </div>
  </v-card>
</template>

<script setup>
defineProps({
  number: String,
  icon: String,
  title: String,
  description: String
});
</script>