<template>
    <v-dialog v-model="model" max-width="700">
      <v-card>
        <v-card-title class="text-lg font-semibold">
          Importer des variables d’un autre modèle
        </v-card-title>
  
        <v-card-text>
          <v-select
            v-model="selectedTemplateId"
            :items="templateOptions"
            label="Modèle de devis, contrat et facture"
            item-title="name"
            item-value="id"
            class="mb-4"
          />
  
          <v-divider class="mb-4" />
  
          <div v-if="availableVariables.length">
            <v-checkbox
              v-for="v in availableVariables"
              :key="v.variableName"
              v-model="selectedVariables"
              :label="`${v.label} ({{${v.variableName}}})`"
              :value="v"
            />
          </div>
  
          <div v-else class="text-gray-500 text-sm">
            Aucun champ disponible pour ce modèle.
          </div>
        </v-card-text>
  
        <v-card-actions class="justify-end">
          <v-btn text @click="close">Annuler</v-btn>
          <v-btn color="primary" @click="submit" :disabled="!selectedVariables.length">
            Importer ({{ selectedVariables.length }})
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>
  
<script setup lang="ts" generic="V extends VariableBase, T extends TemplateBase<V>">
    import { computed, ref, toRef, watch } from 'vue'
    import type { TemplateBase, VariableBase } from '@/types';
    import type { QuoteTemplate, QuoteTemplateVariable } from '@/schemas/quoteTemplate.schema'
    
    const props = defineProps<{
      modelValue: boolean
      templates: T[]
    }>()
    
    const emit = defineEmits<{
      (e: 'update:modelValue', value: boolean): void
      (e: 'import', variables: V[]): void
    }>()
    
    const selectedTemplateId = ref<string>('')
    const selectedVariables = ref<V[]>([])
    const templateOptions = computed(() => props.templates as { id: string; name: string }[])
    
    const model = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    })

    const selectedTemplate = computed(() =>
      props.templates.find((template) => template.id === selectedTemplateId.value)
    )

    const availableVariables = computed(() => selectedTemplate.value?.variables || [])
    
    watch(model, (val) => {
      if (!val) {
        selectedTemplateId.value = ''
        selectedVariables.value = []
      }
    })
    
    function close() {
      model.value = false
    }
    
    function submit() {
      emit('import', selectedVariables.value as V[])
      close()
    }
</script>
  