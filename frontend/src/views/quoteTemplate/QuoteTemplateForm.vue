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
  import type { Editor } from '@tiptap/vue-3'
  import { useRoute } from 'vue-router'
  import QuoteTemplateFormMain from '@/components/QuoteTemplate/QuoteTemplateFormMain.vue'
  import EditableHeader from '@/components/TemplateEditor/EditableHeader.vue'

  import QuoteTemplatePreview from '@/components/ui/PreviewPdf.vue'
  import ImportVariableModal from '@/components/TemplateEditor/variable/VariableImportModal.vue'
  import VariableFormModal from '@/components/TemplateEditor/variable/VariableFormModal.vue'
  import type { QuoteTemplateVariable } from '@/schemas/quoteTemplate.schema'
  import { useQuoteTemplateStore } from '@/stores/quoteTemplate'
  import type { VariableType } from '@/types'

  const route = useRoute()
  const quoteTemplate = useQuoteTemplateStore()
  const templateId = ref<string | null>(null)
  const isEdit = ref(false)
  const isPreviewFullscreen = ref(false)

  const template = reactive({
    id: '',
    name: '',
    contentHtml: '',
    variables: [] as QuoteTemplateVariable[]
  })

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

  function togglePreviewFullscreen() {
    isPreviewFullscreen.value = !isPreviewFullscreen.value
  }

  onMounted(async () => {
    const idParam = route.params.id
    templateId.value = Array.isArray(idParam) ? idParam[0] : idParam || ''
    isEdit.value = !!templateId.value
    
    isEdit.value
      ? await quoteTemplate.fetchTemplate(templateId.value)
      : await quoteTemplate.fetchDefaultTemplate()

    const data = quoteTemplate.currentTemplate || quoteTemplate.defaultTemplate
 
    if (data) {
      Object.assign(template, {
        id: data.id,
        name: data.name,
        contentHtml: data.contentHtml,
        variables: data.variables,
      })
    }
  })

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

  function addImportedVariables(vars: QuoteTemplateVariable[]) {
    const existingNames = new Set(template.variables.map(variable => variable.variableName))
    const toAdd = vars.filter(variable => !existingNames.has(variable.variableName))
    template.variables.push(...toAdd)
  }

  function insertVariableInEditor(index: number) {
    const variable = template.variables[index]
    if (editorRef.value && variable) {
      editorRef.value.commands.insertContent(`{{${variable.variableName}}}`)
    }
  }

  function getLabelVariables(vars: QuoteTemplateVariable[]) {
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
        ? await quoteTemplate.updateTemplate(templateId.value, templateData)
        : await quoteTemplate.createTemplate(templateData)

      if (response) {
        router.push({
            path: '/quote-template',
            state: { toastStatus : 'success', toastMessage: `Le template ${response?.name} a bien été sauvegardé.` }
        });
      }

    } catch (error) {
      console.error('Erreur de sauvegarde :', error)
    }
  }

  function handleVariableSubmit(variable: QuoteTemplateVariable) {
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

<style scoped>
.sticky-preview {
  position: sticky;
  top: 16px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  transition: all 0.3s ease;
}

.fullscreen-preview {
  position: fixed;
  top: 64px; /* Height of the top nav bar */
  left: 256px; /* Width of the side nav bar */
  right: 0;
  bottom: 0;
  z-index: 1000;
  max-height: calc(100vh - 64px); /* Subtract top nav height */
  background: white;
  padding: 16px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.fullscreen-preview :deep(.preview-container) {
  height: calc(100vh - 96px); /* Account for top nav and padding */
  overflow-y: auto;
}

/* When side nav is collapsed */
@media (max-width: 1279px) {
  .fullscreen-preview {
    left: 64px; /* Width of collapsed side nav */
  }
}

/* When side nav is hidden */
@media (max-width: 959px) {
  .fullscreen-preview {
    left: 0;
  }
}

.full-width-header {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
}
</style>
