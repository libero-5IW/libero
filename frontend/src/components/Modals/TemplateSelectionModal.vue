<template>
    <v-dialog v-model="isOpen" max-width="500" persistent>
    <v-card>
        <v-card-title>Choisir un template de {{props.type}}</v-card-title>
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
    <v-btn text v-if="!isForced" @click="cancelSelection">Annuler</v-btn>
    <v-btn color="primary" @click="confirmSelection" :disabled="!selectedTemplate">
        Valider
    </v-btn>
    </v-card-actions>

    </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue';
  
  const props = defineProps<{
    modelValue: boolean;
    fetchTemplates: () => Promise<{ id: string; name: string }[]>;
    isForced?: boolean;
    type: 'devis' | 'contrat' |'facture'
  }>();

  const emit = defineEmits(['update:modelValue', 'templateSelected']);
  
  const isOpen = ref(props.modelValue);
  const selectedTemplate = ref<string>('');
  
  watch(() => props.modelValue, (newVal) => {
    isOpen.value = newVal;
  });

  watch(isOpen, (newVal) => {
    emit('update:modelValue', newVal);
  });
  
  const templates = ref<{ id: string, name: string }[]>([]);
  
  onMounted(async () => {
    templates.value = await props.fetchTemplates();
    if (templates.value.length) {
      selectedTemplate.value = templates.value[0].id;
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
  