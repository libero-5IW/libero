<template>
   <v-card flat class="mb-4">
        <EditableHeader v-model="template.name" back-route-name="QuoteTemplateList" />
      </v-card>
  <v-container fluid>
    <v-row>
      <!-- Editor Column -->
      <v-col cols="12" md="8">
        <QuoteTemplateFormMain
          :template="template"
          :isEdit="isEdit"
          @editor-ready="setEditor"
          :onSave="saveTemplate"
          :variables="template.variables"
          @openEditModal="openEditModal"
          @openRemoveModal="removeVariable" 
          @openImportModal="showImportModal = true"
          @openVariableFormModal="openCreateModal"
        />
      </v-col>

      <!-- Preview Column -->
      <v-col cols="12" md="4">
        <v-card flat class="sticky-preview" :class="{ 'fullscreen-preview': isPreviewFullscreen }">
          <QuoteTemplatePreview
            :contentHtml="template.contentHtml"
            :variables="getLabelVariables(template.variables)"
            fileName="devis"
          />
          <div class="d-flex justify-center pa-2">
            <v-btn
              icon
              @click="togglePreviewFullscreen"
              :title="isPreviewFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
            >
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
      :existing-variable-names="template.variables.map(variable => variable.variableName)"
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
import QuoteTemplateFormMain from '@/components/QuoteTemplate/QuoteTemplateFormMain.vue'
import QuoteTemplatePreview from '@/components/ui/PreviewPdf.vue'
import ImportVariableModal from '@/components/TemplateEditor/variable/VariableImportModal.vue'
import VariableFormModal from '@/components/TemplateEditor/variable/VariableFormModal.vue'

import { useQuoteTemplateStore } from '@/stores/quoteTemplate'
import type { QuoteTemplateVariable } from '@/schemas/quoteTemplate.schema'
import type { VariableType } from '@/types'

const template = reactive({
  id: '',
  name: '',
  contentHtml: '',
  variables: [] as QuoteTemplateVariable[]
})

const route = useRoute()
const quoteTemplate = useQuoteTemplateStore()
const templateId = ref<string | null>(null)
const isEdit = ref(false)
const isPreviewFullscreen = ref(false)

const currentVariable = ref<QuoteTemplateVariable>({
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

  if (isEdit.value) {
    await quoteTemplate.fetchTemplate(templateId.value)
  } else {
    await quoteTemplate.fetchDefaultTemplate()
  }

  const data = isEdit.value
    ? quoteTemplate.currentTemplate
    : quoteTemplate.defaultTemplate

  if (data) {
    const systemVars = data.variables?.filter(v => v.templateId === 'defaultTemplate') || []
    Object.assign(template, {
      id: '',
      name: 'Nouveau modèle de devis',
      contentHtml: data.contentHtml,
      variables: [...systemVars.map(v => ({ ...v }))]
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
  const removedVar = template.variables[index]?.variableName
  template.variables = template.variables.filter((_, i) => i !== index)
  template.variables = [...template.variables]

  const lines = template.contentHtml.split('\n')
  template.contentHtml = lines
    .filter(line => !line.includes(`{{${removedVar}}}`))
    .join('\n')
}

function addImportedVariables(vars: QuoteTemplateVariable[]) {
  const existingNames = new Set(template.variables.map(v => v.variableName))
  const toAdd = vars.filter(v => !existingNames.has(v.variableName))
  template.variables.push(...toAdd)
}

function getLabelVariables(vars: QuoteTemplateVariable[]) {
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
      ? await quoteTemplate.updateTemplate(templateId.value, payload)
      : await quoteTemplate.createTemplate(payload)

    if (response) {
      router.push({
        path: '/quote-template',
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

function handleVariableSubmit(variable: QuoteTemplateVariable) {
  const index = template.variables.findIndex(v =>
    v.variableName === (variableMode.value === 'edit' ? originalVariableName.value : variable.variableName)
  )

  if (variableMode.value === 'edit') {
    if (index !== -1) {
      if (originalVariableName.value !== variable.variableName) {
        template.contentHtml = template.contentHtml.replace(
          new RegExp(`{{\\s*${originalVariableName.value}\\s*}}`, 'g'),
          `{{${variable.variableName}}}`
        )
      }
      template.variables[index] = variable
    }
  } else {
    template.variables.push(variable)
    template.contentHtml += `\n<strong>${variable.label} :</strong> {{${variable.variableName}}}<br/>`
  }

  template.variables = [...template.variables]
  showVariableForm.value = false
}
</script>
