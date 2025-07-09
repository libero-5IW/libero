import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/config/axios'
import { removeSystemVariables } from '@/utils/removeSystemVariables'
import { InvoiceTemplateSchema, type CreateInvoiceTemplate, type InvoiceTemplate } from '@/schemas/invoiceTemplate.schema'
import { handleError } from '@/utils/handleError'

export const useInvoiceTemplateStore = defineStore('invoiceTemplate', () => {
  const templates = ref<InvoiceTemplate[]>([])
  const currentTemplate = ref<InvoiceTemplate | null>(null)
  const defaultTemplate = ref<InvoiceTemplate | null>(null)
  const isLoading = ref(false)

  async function fetchAllTemplates(includeDefault = true) {
    isLoading.value = true
    try {
      const { data } = await apiClient.get('/invoice-templates', {
        params: { includeDefault },
      })
      templates.value = data.map((item: InvoiceTemplate) => InvoiceTemplateSchema.parse(item))
    } catch (error) {
      console.error('error', error)
      templates.value = [];
      handleError(error, 'Erreur lors de la récupération des templates.')
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTemplate(id: string) {
    isLoading.value = true
    try {
      const { data } = await apiClient.get(`/invoice-templates/${id}`)
      currentTemplate.value = InvoiceTemplateSchema.parse(data)
    } catch (error) {
      currentTemplate.value = null;
      handleError(error, 'Erreur lors de la récupération du template.')
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDefaultTemplate() {
    try {
      const { data } = await apiClient.get('/invoice-templates/default-template')
      defaultTemplate.value = InvoiceTemplateSchema.parse(data)
    } catch (error) {
      console.error('error', error)
      handleError(error, 'Erreur lors de la récupération du template par défaut.')
    }
  }

  async function createTemplate(payload: CreateInvoiceTemplate) {
    try {
      const cleanedPayload = removeSystemVariables(payload)
      const { data } = await apiClient.post('/invoice-templates', cleanedPayload)
      return InvoiceTemplateSchema.parse(data)
    } catch (error) {
      console.error('error', error)
      handleError(error, 'Erreur lors de la création du template.')
    }
  }
  
  async function updateTemplate(id: string, payload: Partial<InvoiceTemplate>) {
    try {
      const cleanedPayload = removeSystemVariables(payload)
      const { data } = await apiClient.patch(`/invoice-templates/${id}`, cleanedPayload)
      return InvoiceTemplateSchema.parse(data)
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour du template.')
    }
  }    

  async function deleteTemplate(id: string) {
    try {
      await apiClient.delete(`/invoice-templates/${id}`)
      templates.value = templates.value.filter((template) => template.id !== id)
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression du template.')
    }
  }

  async function duplicateTemplate(id: string) {
    try {
      const { data } = await apiClient.post(`/invoice-templates/${id}/duplicate`)
      return InvoiceTemplateSchema.parse(data)
    } catch (error) {
      handleError(error, 'Erreur lors de la duplication du template.')
    }
  }

  async function searchTemplates(
    term: string,
    startDate?: string | null,
    endDate?: string | null
  ) {
    isLoading.value = true
    try {
      const { data } = await apiClient.get(`/invoice-templates/search`, {
        params: {
          term,
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {})
        }
      })
      templates.value = data.map((item: InvoiceTemplate) =>
        InvoiceTemplateSchema.parse(item)
      )
    } catch (error) {
      templates.value = []
      handleError(error, 'Erreur lors de la recherche des templates.')
    } finally {
      isLoading.value = false
    }
  }  

  return {
    templates,
    currentTemplate,
    defaultTemplate,
    isLoading,
    fetchAllTemplates,
    fetchTemplate,
    fetchDefaultTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    searchTemplates
  }
})
