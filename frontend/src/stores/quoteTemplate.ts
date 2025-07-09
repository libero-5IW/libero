import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/config/axios'
import { removeSystemVariables } from '@/utils/removeSystemVariables'
import { QuoteTemplateSchema, type CreateQuoteTemplate, type QuoteTemplate } from '@/schemas/quoteTemplate.schema'
import { handleError } from '@/utils/handleError'

export const useQuoteTemplateStore = defineStore('quoteTemplate', () => {
  const templates = ref<QuoteTemplate[]>([])
  const currentTemplate = ref<QuoteTemplate | null>(null)
  const defaultTemplate = ref<QuoteTemplate | null>(null)
  const isLoading = ref(false)

  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(9)

  async function fetchAllTemplates(includeDefault = true) {
    isLoading.value = true
    try {
      const { data } = await apiClient.get('/quote-templates', {
        params: { includeDefault },
      })
      templates.value = data.map((item: QuoteTemplate) => QuoteTemplateSchema.parse(item))
      total.value = data.length
      currentPage.value = 1
    } catch (error) {
      templates.value = []
      handleError(error, 'Erreur lors de la récupération des templates.')
    } finally {
      isLoading.value = false
    }
  }  

  async function fetchTemplate(id: string) {
    isLoading.value = true
    try {
      const { data } = await apiClient.get(`/quote-templates/${id}`)
      currentTemplate.value = QuoteTemplateSchema.parse(data)
    } catch (error) {
      currentTemplate.value = null;
      handleError(error, 'Erreur lors de la récupération du template.')
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDefaultTemplate() {
    try {
      const { data } = await apiClient.get('/quote-templates/default-template')
      defaultTemplate.value = QuoteTemplateSchema.parse(data)
    } catch (error) {
      console.error('error', error);
      handleError(error, 'Erreur lors de la récupération du template par défaut.')
    }
  }

  async function createTemplate(payload: CreateQuoteTemplate) {
    try {
      const cleanedPayload = removeSystemVariables(payload)
      const { data } = await apiClient.post('/quote-templates', cleanedPayload)
      return QuoteTemplateSchema.parse(data)
    } catch (error) {
      handleError(error, 'Erreur lors de la création du template.')
    }
  }

  async function updateTemplate(id: string, payload: Partial<QuoteTemplate>) {
    try {
      const cleanedPayload = removeSystemVariables(payload)
      const { data } = await apiClient.patch(`/quote-templates/${id}`, cleanedPayload)
      return QuoteTemplateSchema.parse(data)
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour du template.')
    }
  }

  async function deleteTemplate(id: string) {
    try {
      await apiClient.delete(`/quote-templates/${id}`)
      templates.value = templates.value.filter((template) => template.id !== id)
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression du template.')
    }
  }

  async function duplicateTemplate(id: string) {
    try {
      const { data } = await apiClient.post(`/quote-templates/${id}/duplicate`)
      return QuoteTemplateSchema.parse(data)
    } catch (error) {
      handleError(error, 'Erreur lors de la duplication du template.')
    }
  }

  async function searchTemplates(
    term: string,
    startDate?: string | null,
    endDate?: string | null,
    page = 1,
    size = pageSize.value
  ) {
    isLoading.value = true
    try {
      const { data } = await apiClient.get(`/quote-templates/search`, {
        params: {
          term,
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
          page,
          pageSize: size
        }
      })
      templates.value = data.data.map((item: QuoteTemplate) => QuoteTemplateSchema.parse(item))
      total.value = data.total
      currentPage.value = page
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
    isLoading,
    defaultTemplate,
    fetchAllTemplates,
    fetchTemplate,
    fetchDefaultTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    searchTemplates,
    total,
    currentPage,
    pageSize,
  }
})
