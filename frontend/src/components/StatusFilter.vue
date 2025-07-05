<template>
    <v-select
      v-model="selected"
      :items="options"
      item-title="label"
      item-value="value"
      label="Statut"
      clearable
      class="w-64"
      @update:modelValue="emit('change', selected)"
    />
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue';
  
  defineProps<{
    modelValue: string | null;
    options: { label: string; value: string | null }[];
  }>();
  
  const emit = defineEmits<{
    (e: 'update:modelValue', value: string | null): void;
    (e: 'change', value: string | null): void;
  }>();
  
  const selected = ref<string | null>(null);
  
  watch(
    () => selected.value,
    (val) => emit('update:modelValue', val)
  );
  </script>
  