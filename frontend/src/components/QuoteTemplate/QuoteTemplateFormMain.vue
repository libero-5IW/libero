<template>
      <v-card flat class="mb-4">
        <EditableHeader v-model="template.name" back-route-name="QuoteTemplateList" />
      </v-card>
  
      <v-card flat class="mb-4">
        <TemplateEditor v-model="template.contentHtml"  @editor-ready="handleEditorReady" />
      </v-card>
  
      <v-card flat class="text-right mt-4">
        <v-btn color="primary" @click="onSave">
          <v-icon start>mdi-content-save</v-icon>
          {{ isEdit ? 'Modifier' : 'Créer' }}
        </v-btn>
      </v-card>
</template>
  
<script setup lang="ts">
  import EditableHeader from '@/components/TemplateEditor/EditableHeader.vue'
  import TemplateEditor from '@/components/TemplateEditor/Editor.vue'
  import type { Editor } from '@tiptap/vue-3';

  defineProps<{
    template: any
    isEdit: boolean
    onSave: () => void
  }>()

  const emit = defineEmits(['editor-ready'])

  function handleEditorReady(editorInstance: Editor) {
    emit('editor-ready', editorInstance)
  }
</script>
  