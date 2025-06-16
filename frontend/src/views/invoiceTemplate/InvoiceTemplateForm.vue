<template>
  <v-card flat class="mb-4">
    <EditableHeader v-model="template.name" back-route-name="InvoiceTemplateList" />
  </v-card>

  <v-container fluid>
    <v-row>
      <v-col cols="12" md="8">
        <InvoiceTemplateFormMain
          :template="template"
          :isEdit="isEdit"
          :onSave="saveTemplate"
          :variables="template.variables"
          @editor-ready="setEditor"
          @openEditModal="openEditModal"
          @openRemoveModal="removeVariable"
          @openImportModal="showImportModal = true"
          @openVariableFormModal="openCreateModal"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-card flat class="sticky-preview" :class="{ 'fullscreen-preview': isPreviewFullscreen }">
          <QuoteTemplatePreview
            :contentHtml="template.contentHtml"
            :variables="getLabelVariables(template.variables)"
            fileName="facture"
          />
          <div class="d-flex justify-center pa-2">
            <v-btn icon @click="togglePreviewFullscreen">
              <v-icon>{{ isPreviewFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}</v-icon>
            </v-btn>
          </div>
        </v-card>
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
      :existing-variable-names="template.variables.map(v => v.variableName)"
      :mode="variableMode"
      @submit="handleVariableSubmit"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import router from '@/routes'
import { useRoute } from 'vue-router'
import type { Editor } from '@tiptap/vue-3'

import EditableHeader from '@/components/TemplateEditor/EditableHeader.vue'
import InvoiceTemplateFormMain from '@/components/InvoiceTemplate/InvoiceTemplateFormMain.vue'
import QuoteTemplatePreview from '@/components/ui/PreviewPdf.vue'
import ImportVariableModal from '@/components/TemplateEditor/variable/VariableImportModal.vue'
import VariableFormModal from '@/components/TemplateEditor/variable/VariableFormModal.vue'

import { useInvoiceTemplateStore } from '@/stores/invoiceTemplate'
import type { InvoiceTemplateVariable } from '@/schemas/invoiceTemplate.schema'
import type { VariableType } from '@/types'

const template = reactive({
  id: '',
  name: '',
  contentHtml: '',
  variables: [] as InvoiceTemplateVariable[]
})

const route = useRoute()
const invoiceTemplate = useInvoiceTemplateStore()
const templateId = ref<string | null>(null)
const isEdit = ref(false)
const isPreviewFullscreen = ref(false)

const currentVariable = ref<InvoiceTemplateVariable>({
  variableName: '',
  label: '',
  type: 'string' as VariableType,
  required: false
})

const editorRef = ref<Editor | null>(null)
const showImportModal = ref(false)
const showVariableForm = ref(false)
const variableMode = ref<'create' | 'edit'>('create')
const originalVariableName = ref('')
const otherTemplates = ref([])

onMounted(async () => {
  const idParam = route.params.id
  templateId.value = Array.isArray(idParam) ? idParam[0] : idParam || ''
  isEdit.value = !!templateId.value

  isEdit.value
    ? await invoiceTemplate.fetchTemplate(templateId.value)
    : await invoiceTemplate.fetchDefaultTemplate()

  const data = invoiceTemplate.currentTemplate || invoiceTemplate.defaultTemplate

  if (data) {
  const systemVars = data.variables?.filter(v => v.templateId === 'defaultTemplate') || []
  const userVars = data.variables?.filter(v => v.templateId !== 'defaultTemplate') || []

  Object.assign(template, {
  id: data.id,
  name: data.name,
  contentHtml: data.contentHtml,
  variables: isEdit.value
    ? [...userVars.map(v => ({ ...v })), ...systemVars.map(v => ({ ...v }))]
    : [...systemVars.map(v => ({ ...v }))]
  })
  }

})

function togglePreviewFullscreen() {
  isPreviewFullscreen.value = !isPreviewFullscreen.value
}

function setEditor(editorInstance: Editor) {
  editorRef.value = editorInstance
}

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
    type: 'string' as VariableType,
    required: false
  }
  variableMode.value = 'create'
  showVariableForm.value = true
}

function removeVariable(index: number) {
  template.variables.splice(index, 1)
}

function addImportedVariables(vars: InvoiceTemplateVariable[]) {
  const existingNames = new Set(template.variables.map(v => v.variableName))
  const toAdd = vars.filter(v => !existingNames.has(v.variableName))
  template.variables.push(...toAdd)
}

function getLabelVariables(vars: InvoiceTemplateVariable[]) {
  const result: Record<string, string> = {}
  vars.forEach(v => {
    result[v.variableName] = `<em class="text-gray-500">${v.label}</em>`
  })
  return result
}

async function saveTemplate() {
  try {
    const payload = {
      name: template.name,
      contentHtml: template.contentHtml,
      variables: template.variables.filter(v => v.templateId !== 'defaultTemplate')
    }

    const response = templateId.value
      ? await invoiceTemplate.updateTemplate(templateId.value, payload)
      : await invoiceTemplate.createTemplate(payload)

    if (response) {
      router.push({
        path: '/invoice-template',
        state: {
          toastStatus: 'success',
          toastMessage: `Le template ${response.name} a bien été sauvegardé.`
        }
      })
    }
  } catch (error) {
    console.error('Erreur de sauvegarde :', error)
  }
}

function handleVariableSubmit(variable: InvoiceTemplateVariable) {
  const index = template.variables.findIndex(v =>
    v.variableName === (variableMode.value === 'edit' ? originalVariableName.value : variable.variableName)
  )

  if (variableMode.value === 'edit' && index !== -1) {
    template.variables[index] = variable
  } else {
    template.variables.push(variable)
  }

  showVariableForm.value = false
}
</script>
