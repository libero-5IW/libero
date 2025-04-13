<!-- utile ??? -->
<template>
    <v-select
      v-model="selected"
      :items="variables"
      item-title="label"
      item-value="variableName"
      label="Sélectionner une variable"
      class="mb-4"
    />
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue'
  import type { QuoteTemplateVariable } from '@/schemas/quoteTemplate.schema'
  
  const props = defineProps<{
    variables: QuoteTemplateVariable[]
    modelValue: string
  }>()
  
  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
  }>()
  
  const selected = ref(props.modelValue)
  
  watch(selected, (val) => {
    emit('update:modelValue', val)
  })
  
  watch(
    () => props.modelValue,
    (val) => {
      selected.value = val
    }
  )
  </script>
  