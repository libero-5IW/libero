<template>
  <v-dialog v-model="model" max-width="600">
    <v-card>
      <v-card-title class="text-lg font-semibold">
        {{ mode === 'edit' ? 'Modifier la variable' : 'Nouvelle variable' }}
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" @submit.prevent>
          <v-text-field
            v-model="formData.variableName"
            label="Nom de la variable (interne)"
            required
            :rules="rules.variableName"
            class="mb-4"
          />

          <v-text-field
            v-model="formData.label"
            label="Label affiché"
            required
            :rules="rules.label"
            class="mb-4"
          />

          <v-select
            v-model="formData.type"
            label="Type"
            :items="VariableTypeValues"
            required
            :rules="rules.type"
            class="mb-4"
          />

          <v-switch
            v-model="formData.required"
            label="Requis ?"
            color="primary"
            :rules="rules.required"
          />
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn text @click="close">Annuler</v-btn>
        <v-btn color="primary" @click="submit">Valider</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts" generic="V extends VariableBase">
  import { ref, computed, watch, toRef } from 'vue'
  import { labelRules, requiredBooleanRules, typeRules, variableNameRules } from '@/utils/validationRules'
  import { type VariableBase, VariableTypeValues } from '@/types';
  
  const props = defineProps<{
    modelValue: boolean
    currentVariable: V
    existingVariableNames: string[]
    originalVariableName: string
    mode?: 'create' | 'edit'
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'submit', variable: V): void
  }>()

  const model = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  })
  
  const formRef = ref()
  const mode = computed(() => props.mode ?? 'create')
  const currentVariableRef = toRef(props, 'currentVariable')
  const formData = ref<V>({ ...currentVariableRef.value })
  
  watch(model, (val) => {
    if (!val) {
      formData.value = { ...currentVariableRef.value }
    }
  })

  watch(currentVariableRef, (newVariable) => {
    formData.value = { ...newVariable }
  }, { immediate: true })

  async function submit() {
    const result = await formRef.value?.validate()

    if (result?.valid) {
      emit('submit', formData.value as V)
      close()
    }
  }

  function close() {
    model.value = false
  }

  const rules = computed(() => ({
    variableName: variableNameRules({
      existingNames: props.existingVariableNames || [],
      originalName: props.originalVariableName || '',
      mode: mode.value,
    }),
    label: labelRules(),
    type: typeRules(),
    required: requiredBooleanRules(),
  }))
</script>
