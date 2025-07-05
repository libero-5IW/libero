<template>
  <div
    class="rounded-[20px] p-[1px] transition-all"
    :class="featured ? 'border border-[#6366f1] bg-gradient-to-br from-[#fefcfb] via-[#f0f4ff] to-[#e0e7ff]': 'bg-white dark:bg-gray-900'"
  >
    <v-card
      class="rounded-[20px] bg-transparent px-6 py-8"
      elevation="0"
    >
    <div class="flex items-start gap-4 mb-4">
      <div class="w-12 h-12 rounded-[12px] bg-[#6366f1] flex items-center justify-center">
        <v-icon :icon="icon" size="24" color="white" />
      </div>
      <v-card-title class="text-xl font-semibold text-gray-900 dark:text-white p-0">
        {{ title }}
      </v-card-title>
    </div>
    <v-card-text class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed p-0">
      {{ description }}
    </v-card-text>
  </v-card>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  title: String,
  description: String,
  featured: Boolean
});
</script>