<template>
  <v-dialog v-model="isOpen" max-width="500">
    <v-card>
      <v-card-title class="text-h6 font-semibold">
        {{ title || 'Confirmation' }}
      </v-card-title>

      <v-card-text class="text-body-1 text-gray-700">
        {{ message || 'Voulez-vous vraiment continuer cette action ?' }}
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="emitCancel">
          {{ cancelText }}
        </v-btn>
        <v-btn :color="confirmColor" variant="flat" @click="emitConfirm">
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  message: String,
  confirmText: {
    type: String,
    default: 'Confirmer',
  },
  cancelText: {
    type: String,
    default: 'Annuler',
  },
  confirmColor: {
    type: String,
    default: 'primary',
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

function emitConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function emitCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

const isOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})
</script>