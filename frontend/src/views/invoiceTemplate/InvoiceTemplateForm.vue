<template>
    <v-container fluid>
      <v-row dense>
  
        <v-col cols="12" md="8">
          <InvoiceTemplateFormMain
            :template="template"
            :isEdit="isEdit"
            :editorRef="editorRef"
            :onSave="saveTemplate"
          />
        </v-col>
  
        <v-col cols="12" md="4">
          <QuoteTemplateSidebar
            :variables="template.variables"
            @openEditModal="openEditModal"
            @openRemoveModal="removeVariable" 
            @openImportModal="showImportModal = true"
            @openVariableFormModal="openCreateModal"
            @addVariableToEditor="insertVariableInEditor"
          />
  
          <v-divider class="mt-8 mb-8" />
  
          <QuoteTemplatePreview
            :contentHtml="template.contentHtml"
            :variables="getLabelVariables(template.variables)"
            fileName="facture"
          />
        </v-col>
  
      </v-row>
  
      <ImportVariableModal
        v-model="showImportModal"
        :templates="otherTemplates"
        @import="addImportedVariables"
      />
  
      <VariableFormModal
        v-model="showVariableForm"
        :current-variable="currentVariable"
        :original-variable-name="originalVariableName"
        :existing-variable-names="template.variables.map((variable: InvoiceTemplateVariable) => variable.variableName)"
        :mode="variableMode"
        @submit="handleVariableSubmit"
      />
    </v-container>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import router from '@/routes'
  import type { Editor } from '@tiptap/vue-3'
  import { useRoute } from 'vue-router'
  
  import InvoiceTemplateFormMain from '@/components/InvoiceTemplate/InvoiceTemplateFormMain.vue'
  import QuoteTemplateSidebar from '@/components/TemplateEditor/Sidebar.vue'
  import QuoteTemplatePreview from '@/components/ui/PreviewPdf.vue'
  import ImportVariableModal from '@/components/TemplateEditor/variable/VariableImportModal.vue'
  import VariableFormModal from '@/components/TemplateEditor/variable/VariableFormModal.vue'
  import TemplateEditor from '@/components/TemplateEditor/Editor.vue'
  
  import type { InvoiceTemplateVariable } from '@/schemas/invoiceTemplate.schema'
  import { useInvoiceTemplateStore } from '@/stores/invoiceTemplate'
  
  const route = useRoute()
  const invoiceTemplate = useInvoiceTemplateStore()
  const templateId = ref<string | null>(null)
  const isEdit = ref(false)
  
  const template = reactive({
    id: '',
    name: '',
    contentHtml: '',
    variables: [] as InvoiceTemplateVariable[]
  })
  
  const currentVariable = ref<InvoiceTemplateVariable>({
    variableName: '',
    label: '',
    type: 'string',
    required: false
  })
  
  const editorRef = ref<InstanceType<typeof TemplateEditor> & { getEditor?: () => Editor | undefined }>()
  
  const showImportModal = ref(false)
  const showVariableForm = ref(false)
  const variableMode = ref<'create' | 'edit'>('create')
  const originalVariableName = ref('')
  const otherTemplates = ref([])
  
  onMounted(async () => {
    const idParam = route.params.id
    templateId.value = Array.isArray(idParam) ? idParam[0] : idParam || ''
    isEdit.value = !!templateId.value
  
    const loadedTemplate = isEdit.value
      ? await invoiceTemplate.fetchTemplate(templateId.value)
      : await invoiceTemplate.fetchDefaultTemplate()
  
    const data = invoiceTemplate.currentTemplate || loadedTemplate
  
    if (data) {
      Object.assign(template, {
        id: data.id || '',
        name: data.name,
        contentHtml: data.contentHtml,
        variables: data.variables,
      })
    }
  })
  
  function openEditModal(index: number) {
    currentVariable.value = { ...template.variables[index] }
    originalVariableName.value = currentVariable.value.variableName
    variableMode.value = 'edit'
    showVariableForm.value = true
  }
  
  function openCreateModal() {
    currentVariable.value = {
      variableName: '',
      label: '',
      type: 'string',
      required: false
    }
    variableMode.value = 'create'
    showVariableForm.value = true
  }
  
  function removeVariable(index: number) {
    template.variables.splice(index, 1)
  }
  
  function addImportedVariables(vars: InvoiceTemplateVariable[]) {
    const existingNames = new Set(
        template.variables.map((variable: InvoiceTemplateVariable) => variable.variableName)
    )
    const toAdd = vars.filter(variable => !existingNames.has(variable.variableName))
    template.variables.push(...toAdd)
  }
  
  function insertVariableInEditor(index: number) {
    const variable = template.variables[index]
    const editor = editorRef.value?.getEditor?.()
    if (editor && variable) {
      editor.commands.insertContent(`{{${variable.variableName}}}`)
    }
  }
  
  function getLabelVariables(vars: InvoiceTemplateVariable[]) {
    const result: Record<string, string> = {}
    vars.forEach((v) => {
      result[v.variableName] = `<em class="text-gray-500">${v.label}</em>`
    })
    return result
  }
  
  async function saveTemplate() {
    try {
      const templateData = {
        name: template.name,
        contentHtml: template.contentHtml,
        variables: template.variables,
      }
  
      const response = templateId.value 
        ? await invoiceTemplate.updateTemplate(templateId.value, templateData)
        : await invoiceTemplate.createTemplate(templateData)
  
      if (response) {
        router.push({
          path: '/invoice-template',
          state: { toastStatus : 'success', toastMessage: `Le template ${response?.name} a bien été sauvegardé.` }
        });
      }
  
    } catch (error) {
      console.error('Erreur de sauvegarde :', error)
    }
  }
  
  function handleVariableSubmit(variable: InvoiceTemplateVariable) {
    const index = template.variables.findIndex(
      v => v.variableName === (variableMode.value === 'edit' ? originalVariableName.value : variable.variableName)
    )
  
    if (variableMode.value === 'edit') {
      if (index !== -1) {
        template.variables[index] = variable  
      }
    } else {
      template.variables.push(variable)
    }
    showVariableForm.value = false
  }
  </script>
  