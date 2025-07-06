<template>
  <div class="min-h-screen flex justify-center items-center bg-gradient-to-br from-white via-indigo-200 to-white">
    <div :class="containerClass">
      <div class="bg-white rounded-xl shadow-lg">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  size?: 'sm' | 'md' | 'lg'
}>()

const containerClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-full max-w-md px-4'
    case 'lg': return 'w-full max-w-3xl px-6'
    default: return 'w-full max-w-lg px-6'
  }
})
</script>
