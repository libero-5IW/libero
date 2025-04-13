<template>
    <div class="flex items-center gap-2">
        <div v-if="!editing" class="text-lg font-semibold whitespace-nowrap">
            {{ modelValue }}
            <v-btn icon size="x-small" variant="text" @click="editing = true">
            <v-icon>mdi-pencil</v-icon>
            </v-btn>
        </div>
        <div v-else class="relative">
            <input
                v-model="localValue"
                type="text"
                class="text-xl font-semibold border-b border-gray-300 focus:outline-none focus:border-gray-500 pr-6"
                @blur="submit"
                @keyup.enter="submit"
                autofocus
            />
            <v-btn icon size="x-small" variant="text" @click="submit">
                <v-icon
                    icon="mdi-check"
                />
            </v-btn>
        </div>
    </div>
</template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue'
  
  const props = defineProps<{
    modelValue: string
  }>()
  
  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
  }>()
  
  const editing = ref(false)
  const localValue = ref(props.modelValue)
  
  watch(() => props.modelValue, (val) => {
    localValue.value = val
  })
  
  function submit() {
    editing.value = false
    emit('update:modelValue', localValue.value)
  }
  </script>
  