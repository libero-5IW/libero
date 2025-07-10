<template>
  <div class="flex items-center gap-2">
    <div
      v-if="!editing"
      class="text-2xl font-bold whitespace-nowrap flex items-center transition-colors duration-200"
    >
      {{ modelValue }}
      <v-btn
        icon
        size="small"
        variant="text"
        class="ml-1 hover:text-primary hover:bg-black/5"
        @click="editing = true"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
    </div>
    <div v-else class="relative flex items-center">
      <input
        v-model="localValue"
        type="text"
        class="text-2xl font-bold border-b border-gray-300 focus:outline-none focus:border-primary pr-8 min-w-[180px] bg-transparent transition-colors duration-200"
        @blur="submit"
        @keyup.enter="submit"
        autofocus
      />
      <v-btn
        icon
        size="small"
        variant="text"
        class="ml-1 hover:text-success hover:bg-black/5"
        @click="submit"
      >
        <v-icon icon="mdi-check" />
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
