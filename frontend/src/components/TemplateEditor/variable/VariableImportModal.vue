<template>
    <v-dialog v-model="model" max-width="700">
      <v-card>
        <v-card-title class="text-lg font-semibold">
          Importer des variables d’un autre modèle
        </v-card-title>
  
        <v-card-text>
          <v-select
            v-model="selectedType"
            :items="typeOptions"
            label="Type de modèle"
            class="mb-4"
          />

          <v-select
            v-if="selectedType"
            v-model="selectedTemplateId"
            :items="templateOptions"
            label="Modèle"
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
              :label="`${v.label} (${v.variableName})`"

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
    import { useInvoiceTemplateStore } from '@/stores/invoiceTemplate'
    import { useContractTemplateStore } from '@/stores/contractTemplate'
    import { useQuoteTemplateStore } from '@/stores/quoteTemplate'

    const selectedType = ref<'invoice' | 'contract' | 'quote' | ''>('');
    const typeOptions = ['invoice', 'contract', 'quote'];
    const templateOptions = ref<{ id: string; name: string; variables: V[] }[]>([])
    const contractTemplateStore = useContractTemplateStore()
    const quoteTemplateStore = useQuoteTemplateStore()

    const props = defineProps<{
      modelValue: boolean
      templates: T[]
    }>()
    
    const emit = defineEmits<{
      (e: 'update:modelValue', value: boolean): void
      (e: 'import', variables: V[]): void
    }>()
    
      const selectedVariables = ref<V[]>([])
    
    const model = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    })

    const selectedTemplateId = ref<string | null>(null)
    
    const selectedTemplate = computed(() =>
    templateOptions.value.find(t => t.id === selectedTemplateId.value) || null
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

    const invoiceTemplateStore = useInvoiceTemplateStore()

    watch(selectedType, async (type) => {
      selectedTemplateId.value = ''
      selectedVariables.value = []

      if (!type) return

      if (type === 'invoice') {
        await invoiceTemplateStore.fetchAllTemplates()
        templateOptions.value = invoiceTemplateStore.templates as T[]
      } else if (type === 'contract') {
        await contractTemplateStore.fetchAllTemplates()
        templateOptions.value = contractTemplateStore.templates as T[]
      } else if (type === 'quote') {
        await quoteTemplateStore.fetchAllTemplates()
        templateOptions.value = quoteTemplateStore.templates as T[]
      }
    })

</script>
  