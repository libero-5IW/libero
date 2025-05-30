<template>
  <v-container fluid>
    <v-row dense>

      <v-col cols="12" md="8">
        <QuoteTemplateFormMain
          :template="template"
          :isEdit="isEdit"
          @editor-ready="setEditor"
          :onSave="saveTemplate"
          :variables="template.variables"
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
            fileName="devis"
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
  import QuoteTemplateSidebar from '@/components/TemplateEditor/Sidebar.vue'
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

  //a voir pour importer des variables d'autres templates
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
