<template>
    <v-dialog v-model="isOpen" max-width="500">
      <v-card>
        <v-card-title>Sélectionner un template</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedTemplate"
            :items="templates"
            item-title="name"
            item-value="id"
            label="Choisissez un template"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" :disabled="!selectedTemplate" @click="confirmSelection">
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
  const invoiceTemplateStore = useInvoiceTemplateStore();
  
  const templates = ref([]);
  
  onMounted(async () => {
    await invoiceTemplateStore.fetchAllTemplates();
    templates.value = invoiceTemplateStore.templates;
    // 👉 Mettre le template par défaut en premier
    templates.value.sort((a, b) => a.isDefault ? -1 : 1);
  });
  
  watch(() => props.modelValue, (val) => isOpen.value = val);
  watch(isOpen, (val) => emit('update:modelValue', val));
  
  function confirmSelection() {
    emit('templateSelected', selectedTemplate.value);
    isOpen.value = false;
  }
  </script>
  