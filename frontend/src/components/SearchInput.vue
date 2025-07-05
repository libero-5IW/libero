<template>
    <v-text-field
      v-model="internalValue"
      :placeholder="placeholder"
      prepend-inner-icon="mdi-magnify"
      density="compact"
      clearable
      variant="outlined"
      class="w-full max-w-md"
    />
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue'
  import { debounce } from 'lodash'
  
  const props = defineProps<{
    modelValue: string
    placeholder?: string
  }>()
  
  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'search', value: string): void
  }>()
  
  const internalValue = ref(props.modelValue)
  
  watch(() => props.modelValue, (val) => {
    internalValue.value = val
  })
  
  watch(internalValue, (val) => {
    emit('update:modelValue', val)
    debouncedSearch(val)
  })
  
  const debouncedSearch = debounce((value: string) => {
    emit('search', value)
  }, 400)
  </script>
  