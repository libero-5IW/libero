<template>
    <v-dialog v-model="isOpen" max-width="500">
    <v-card>
        <v-card-title>Choisir un template</v-card-title>
        <v-card-text>
        <v-select
            v-model="selectedTemplate"
            :items="templates"
            item-title="name"
            item-value="id"
            label="Sélectionner un template"
        />
        </v-card-text>
        <v-card-actions>
    <v-spacer></v-spacer>
    <v-btn text @click="cancelSelection">Annuler</v-btn>
    <v-btn color="primary" @click="confirmSelection" :disabled="!selectedTemplate">
        Valider
    </v-btn>
    </v-card-actions>

    </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue';
  import { useInvoiceTemplateStore } from '@/stores/invoiceTemplate';
  
  const props = defineProps<{ modelValue: boolean }>();
  const emit = defineEmits(['update:modelValue', 'templateSelected']);
  
  const isOpen = ref(props.modelValue);
  const selectedTemplate = ref<string>('');
  
  watch(() => props.modelValue, (newVal) => {
    isOpen.value = newVal;
  });
  
  const invoiceTemplateStore = useInvoiceTemplateStore();
  const templates = ref<{ id: string, name: string }[]>([]);
  
  onMounted(async () => {
  await invoiceTemplateStore.fetchAllTemplates();
  templates.value = invoiceTemplateStore.templates
    .filter(t => t.id)
    .map(t => ({ id: t.id as string, name: t.name }));

  const defaultTemplate = templates.value.find(t => t.name === 'Modèle de base - Facture');
  if (defaultTemplate) {
    selectedTemplate.value = defaultTemplate.id;
  }
  });

  function confirmSelection() {
    emit('templateSelected', selectedTemplate.value);
    emit('update:modelValue', false);
  }

  function cancelSelection() {
  emit('update:modelValue', false);
}
</script>
  