<template>
    <v-card flat class="mb-4">
      <EditableHeader v-model="template.name" back-route-name="InvoiceTemplateList" />
    </v-card>
  
    <v-card flat class="mb-4">
      <TemplateEditor v-model="template.contentHtml" ref="editorRef" />
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
  
  defineProps<{
    template: any
    isEdit: boolean
    editorRef: any
    onSave: () => void
  }>()
  </script>
  