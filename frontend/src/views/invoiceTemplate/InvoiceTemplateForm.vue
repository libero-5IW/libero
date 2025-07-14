<template>
  <div class="bg-white">
    <v-card flat class="mb-4">
      <EditableHeader
        v-model="template.name"
        back-route-name="InvoiceTemplateList"
        aria-label="Édition du nom du template de facture"
      />
    </v-card>

    <v-container fluid role="main" aria-labelledby="invoice-template-title" tabindex="-1" ref="mainContent">
      
      <v-row>
        <v-col cols="12" md="8">
          <InvoiceTemplateFormMain
            :template="template"
            :isEdit="isEdit"
            :onSave="saveTemplate"
            :variables="template.variables"
            :isLoading="isLoading"
            @editor-ready="setEditor"
            @openEditModal="openEditModal"
            @openRemoveModal="removeVariable"
            @openImportModal="showImportModal = true"
            @openVariableFormModal="openCreateModal"
          />
        </v-col>

        <v-col cols="12" md="4">
          <template v-if="!isPreviewFullscreen">
            <v-card flat class="sticky-preview" :class="{ 'fullscreen-preview': isPreviewFullscreen }">
              <InvoiceTemplatePreview
                :contentHtml="template.contentHtml"
                :variables="getLabelVariables(template.variables)"
                fileName="facture"
                aria-label="Prévisualisation du template PDF de facture"
                role="region"
              />
              <div class="d-flex justify-center pa-2">
                <v-btn icon @click="togglePreviewFullscreen"
                  :aria-label="isPreviewFullscreen ? 'Quitter le mode plein écran' : 'Activer le mode plein écran'">
                  <v-icon>{{ isPreviewFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}</v-icon>
                </v-btn>
              </div>
            </v-card>
          </template>
        </v-col>
      </v-row>

      <teleport to="body" v-if="isPreviewFullscreen">
        <div class="fixed inset-0 z-[2000] bg-white flex flex-col items-center justify-center overflow-auto m-0 rounded-none">
          <v-card flat class="w-full h-full max-w-[90vw] max-h-[90vh] overflow-auto">
            <InvoiceTemplatePreview
              :contentHtml="template.contentHtml"
              :variables="getLabelVariables(template.variables)"
              fileName="facture"
              aria-label="Prévisualisation du template PDF de facture"
              role="region"
            />
            <div class="d-flex justify-center pa-2">
              <v-btn
                icon
                @click="togglePreviewFullscreen"
                :aria-label="isPreviewFullscreen ? 'Quitter le mode plein écran' : 'Activer le mode plein écran'"
              >
                <v-icon>
                  {{ isPreviewFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}
                </v-icon>
              </v-btn>
            </div>
          </v-card>
        </div>
      </teleport>

      <ImportVariableModal
        v-model="showImportModal"
        :templates="otherTemplates"
        @import="handleImportVariables"
      />

      <VariableFormModal
        v-model="showVariableForm"
        :current-variable="currentVariable"
        :original-variable-name="originalVariableName"
        :existing-variable-names="template.variables.filter(v => !v.templateId).map(v => v.variableName)"
        :mode="variableMode"
        @submit="handleVariableSubmit"
      />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import router from '@/routes'
import { useRoute } from 'vue-router'
import type { Editor } from '@tiptap/vue-3'

import EditableHeader from '@/components/TemplateEditor/EditableHeader.vue'
import InvoiceTemplateFormMain from '@/components/InvoiceTemplate/InvoiceTemplateFormMain.vue'
import InvoiceTemplatePreview from '@/components/ui/PreviewPdf.vue'
import ImportVariableModal from '@/components/TemplateEditor/variable/VariableImportModal.vue'
import VariableFormModal from '@/components/TemplateEditor/variable/VariableFormModal.vue'

import { useInvoiceTemplateStore } from '@/stores/invoiceTemplate'
import type { InvoiceTemplateVariable } from '@/schemas/invoiceTemplate.schema'
import type { VariableType } from '@/types'
import {
  replaceBracketsWithChips,
  replaceChipsWithBrackets
} from '@/composables/useTemplateVariableParser'
import { ensurePdfWrapper } from '@/utils/pdfWrapper'

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
const isLoading = computed(() => invoiceTemplate.isLoading)

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

let logoUrl = `${window.location.origin}/logo.png`;

onMounted(async () => {
  const idParam = route.params.id
  templateId.value = Array.isArray(idParam) ? idParam[0] : idParam || ''
  isEdit.value = !!templateId.value

  if (isEdit.value) {
    await invoiceTemplate.fetchTemplate(templateId.value)
  } else {
    await invoiceTemplate.fetchDefaultTemplate()
  }

  const data = isEdit.value
    ? invoiceTemplate.currentTemplate
    : invoiceTemplate.defaultTemplate

    if (data) {
      Object.assign(template, {
        id: data.id,
        name: data.name,
        contentHtml: replaceBracketsWithChips(data.contentHtml, data.variables),
        variables: [...(data.variables || []).map(v => ({ ...v }))]
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
  const dom = new DOMParser().parseFromString(template.contentHtml, 'text/html')
  const chips = dom.querySelectorAll(`span[data-type="variable"][data-variable-name="${removedVar}"]`)

  chips.forEach(chip => {
    chip.replaceWith('')
  })

  template.contentHtml = dom.body.innerHTML;

  template.variables = template.variables.filter((_, i) => i !== index);
}

function handleImportVariables(vars: InvoiceTemplateVariable[]) {
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
    const htmlForBackend = ensurePdfWrapper(
      replaceChipsWithBrackets(template.contentHtml ?? ''),
      logoUrl
    );
    const payload = {
      name: template.name,
      contentHtml: htmlForBackend,
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


async function handleVariableSubmit(variable: InvoiceTemplateVariable) {
  const index = template.variables.findIndex(v =>
    v.variableName === (variableMode.value === 'edit' ? originalVariableName.value : variable.variableName)
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
