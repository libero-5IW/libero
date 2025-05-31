<template>
  <div class="flex items-center gap-2">
    <div
      v-if="!editing"
      class="editable-title text-2xl font-bold whitespace-nowrap flex items-center"
    >
      {{ modelValue }}
      <v-btn
        icon
        size="small"
        variant="text"
        class="ml-1 edit-btn"
        @click="editing = true"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
    </div>
    <div v-else class="relative flex items-center">
      <input
        v-model="localValue"
        type="text"
        class="editable-title-input text-2xl font-bold border-b border-gray-300 focus:outline-none focus:border-primary pr-8"
        @blur="submit"
        @keyup.enter="submit"
        autofocus
      />
      <v-btn
        icon
        size="small"
        variant="text"
        class="ml-1 check-btn"
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

<style scoped>
.editable-title {
  transition: color 0.2s;
}
.edit-btn:hover {
  color: var(--v-theme-primary);
  background: rgba(0,0,0,0.03);
}
.check-btn:hover {
  color: var(--v-theme-success);
  background: rgba(0,0,0,0.03);
}
.editable-title-input {
  min-width: 180px;
  background: transparent;
  transition: border-color 0.2s;
}
</style>
