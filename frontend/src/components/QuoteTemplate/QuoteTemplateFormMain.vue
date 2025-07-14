<template>
      <v-card flat class="mb-4 max-w-[850px] mx-auto">
        <TemplateEditor 
          v-model="template.contentHtml" 
          :variables="variables"
          @editor-ready="handleEditorReady"
          @openEditModal="handleOpenEditModal"
          @openRemoveModal="handleOpenRemoveModal"
          @openImportModal="handleOpenImportModal"
          @openVariableFormModal="handleOpenVariableFormModal"
        />

        <v-card-actions class="d-flex justify-end w-full px-4 pb-4">
          <v-btn color="primary" variant="flat" class="px-4 py-2" @click="onSave" :disabled="isLoading">
            <template v-if="!isLoading">
              <v-icon start>mdi-content-save</v-icon>
              {{ isEdit ? 'Modifier' : 'Créer' }}
            </template>
            <v-progress-circular
              v-else
              indeterminate
              size="20"
              color="white"
              aria-label="Chargement de la sauvegarde du template"
            />
          </v-btn>
        </v-card-actions>
      </v-card>
</template>
  
<script setup lang="ts">
  import TemplateEditor from '@/components/TemplateEditor/Editor.vue'
  import type { Editor } from '@tiptap/vue-3';
  import type { QuoteTemplateVariable } from '@/schemas/quoteTemplate.schema'

  defineProps<{
    template: any
    isEdit: boolean
    isLoading: boolean
    onSave: () => void
    variables: QuoteTemplateVariable[]
  }>()

  const emit = defineEmits<{
    (e: 'editor-ready', editor: Editor): void
    (e: 'openEditModal', index: number): void
    (e: 'openRemoveModal', index: number): void
    (e: 'openImportModal'): void
    (e: 'openVariableFormModal'): void
  }>()

  function handleEditorReady(editorInstance: Editor) {
    emit('editor-ready', editorInstance)
  }

  function handleOpenEditModal(index: number) {
    emit('openEditModal', index)
  }

  function handleOpenRemoveModal(index: number) {
    emit('openRemoveModal', index)
  }

  function handleOpenImportModal() {
    emit('openImportModal')
  }

  function handleOpenVariableFormModal() {
    emit('openVariableFormModal')
  }


</script>
  