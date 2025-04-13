<template>
  <v-card flat class="mb-4">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-lg font-semibold">{{ isAddVariable ? 'Ajout d\'une variable' :'Variables' }}</h2>
      
      <div class="flex gap-2 mr-2">
        <v-tooltip text="Ajouter une nouvelle variable">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="openVariableFormModal">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip text="Importer une variable existante">
          <template #activator="{ props }">
            <v-btn v-bind="props" class="m-2" icon @click="openImportModal">
              <v-icon>mdi-import</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </div>
    </div>

    <v-list class="flex-1 overflow-y-auto max-h-[400px]">
      <v-list-item
        v-for="(variable, index) in props.variables"
        :key="index"
        class="border rounded-md mb-2 px-4 py-2 flex flex-col gap-2"
      >
        <VariableDetails :variable="variable" />

        <div class="flex justify-end items-center gap-4">
          <v-tooltip text="Insérer la variable dans l’éditeur">
            <template #activator="{ props }">
              <v-icon v-bind="props" @click="addVariableToEditor(index)">
                mdi-file-document-plus-outline
              </v-icon>
            </template>
          </v-tooltip>

          <v-tooltip v-if="!isSystemVariable(variable)" text="Modifier la variable">
            <template #activator="{ props }">
              <v-icon v-bind="props" @click="openVariableEditModal(index)">
                mdi-pencil
              </v-icon>
            </template>
          </v-tooltip>

          <v-tooltip v-if="!isSystemVariable(variable)" text="Supprimer la variable">
            <template #activator="{ props }">
              <v-icon v-bind="props" @click="removeVariable(index)">
                mdi-delete
              </v-icon>
            </template>
          </v-tooltip>
        </div>
      </v-list-item>
    </v-list>
  </v-card>
</template>

  
<script setup lang="ts" generic="T extends VariableBase">
  import VariableDetails from '@/components/TemplateEditor/variable/VariableDetails.vue'
  import { ref } from 'vue';
  import type { VariableBase } from '@/types';

  const props = defineProps<{
    variables: T[]
  }>()

  const isAddVariable = ref(false)
  
  const emit = defineEmits<{
    (e: 'openEditModal', index: number): void
    (e: 'openRemoveModal', index: number): void
    (e: 'openImportModal'): void
    (e: 'openVariableFormModal'): void
    (e: 'insertVariable'): void
    (e: 'addVariableToEditor', index: number): void
  }>()
  
  function openVariableEditModal(index: number) {
    emit('openEditModal', index)
  }
  
  function removeVariable(index: number) {
    emit('openRemoveModal', index)
  }
  
  function openImportModal() {
    emit('openImportModal')
  }

  function openVariableFormModal() {
    emit('openVariableFormModal')
  }
  
  function addVariableToEditor(index: number) {
    emit('addVariableToEditor', index)
  }

  function isSystemVariable(variable: VariableBase) {
    return variable.id && variable.id === 'systemVariable'
  }

</script>
