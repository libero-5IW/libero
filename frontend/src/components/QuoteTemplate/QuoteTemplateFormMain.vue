<template>
    
  
  
      <v-card flat class="mb-4">
        <TemplateEditor 
          v-model="template.contentHtml" 
          :variables="variables"
          @editor-ready="handleEditorReady"
          @openEditModal="handleOpenEditModal"
          @openRemoveModal="handleOpenRemoveModal"
          @openImportModal="handleOpenImportModal"
          @openVariableFormModal="handleOpenVariableFormModal"
        />
      </v-card>
  
      <v-card flat class="text-right mt-4">
        <v-btn color="primary" @click="onSave">
          <v-icon start>mdi-content-save</v-icon>
          {{ isEdit ? 'Modifier' : 'Créer' }}
        </v-btn>
      </v-card>
</template>
  
<script setup lang="ts">
  import TemplateEditor from '@/components/TemplateEditor/Editor.vue'
  import type { Editor } from '@tiptap/vue-3';
  import type { QuoteTemplateVariable } from '@/schemas/quoteTemplate.schema'

  defineProps<{
    template: any
    isEdit: boolean
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
  