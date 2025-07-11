<template>
  <v-dialog v-model="model" max-width="500">
    <v-card>
      <v-card-title class="text-lg font-semibold">
        Changement de statut

        <v-tooltip location="top">
          <template #activator="{ props }">
            <v-icon v-bind="props" size="18" class="ml-2">mdi-information-outline</v-icon>
          </template>
          <span>Le changement de statut manuel est seulement à titre informatif.</span>
        </v-tooltip>
      </v-card-title>

      <v-card-text>
        <p class="font-semibold mb-4">Statut actuel : {{ translateStatus(currentLabel) }}</p>
        <v-radio-group v-model="selectedStatus">
          <v-radio
            v-for="status in availableStatuses"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          >
            <template #label>
              <div class="flex items-center justify-between w-full">
                <span>{{ status.label }}</span>
                <v-tooltip v-if="status.description" location="top">
                  <template #activator="{ props }">
                    <v-icon v-bind="props" size="18" class="ml-2">mdi-information-outline</v-icon>
                  </template>
                  <span>{{ status.description }}</span>
                </v-tooltip>
              </div>
            </template>
          </v-radio>
        </v-radio-group>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn text @click="close">Annuler</v-btn>
        <v-btn
          color="primary"
          @click="submit"
          :disabled="!selectedStatus || selectedStatus === currentStatus"
        >
          Changer le statut
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { translateStatus } from '@/utils/status'

const props = defineProps<{
  modelValue: boolean
  currentStatus: string
  availableStatuses: { value: string; label: string; description?: string }[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', newStatus: string): void
}>()

const selectedStatus = ref<string | null>(null)

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const currentLabel = computed(() => {
  return props.availableStatuses.find(s => s.value === props.currentStatus)?.label || props.currentStatus
})

function close() {
  model.value = false
  selectedStatus.value = null
}

function submit() {
  if (selectedStatus.value && selectedStatus.value !== props.currentStatus) {
    emit('change', selectedStatus.value)
    close()
  }
}
</script>
