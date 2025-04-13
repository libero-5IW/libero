import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/config/axios'
import { removeSystemVariables } from '@/utils/removeSystemVariables'
import { QuoteTemplateSchema, type QuoteTemplate } from '@/schemas/quoteTemplate.schema'
import { handleAxiosError } from '@/utils/handleAxiosError'

export const useQuoteTemplateStore = defineStore('quoteTemplate', () => {
  const templates = ref<QuoteTemplate[]>([])
  const currentTemplate = ref<QuoteTemplate | null>(null)
  const isLoading = ref(false)

  async function fetchAllTemplates() {
    isLoading.value = true
    try {
      const { data } = await apiClient.get('/quote-templates')
      templates.value = data.map((item: QuoteTemplate) => QuoteTemplateSchema.parse(item))
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la récupération des templates.')
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
      handleAxiosError(error, 'Erreur lors de la récupération du template.')
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDefaultTemplate() {
    try {
      const { data } = await apiClient.get('/quote-templates/default-template')
      return QuoteTemplateSchema.parse(data)
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la récupération du template par défaut.')
    }
  }

  async function createTemplate(payload: QuoteTemplate) {
    try {
      const cleanedPayload = removeSystemVariables(payload)
      const { data } = await apiClient.post('/quote-templates', cleanedPayload)
      return QuoteTemplateSchema.parse(data)
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la création du template.')
    }
  }

  async function updateTemplate(id: string, payload: Partial<QuoteTemplate>) {
    try {
      const cleanedPayload = removeSystemVariables(payload)
      const { data } = await apiClient.patch(`/quote-templates/${id}`, cleanedPayload)
      return QuoteTemplateSchema.parse(data)
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la mise à jour du template.')
    }
  }

  async function deleteTemplate(id: string) {
    try {
      await apiClient.delete(`/quote-templates/${id}`)
      templates.value = templates.value.filter((template) => template.id !== id)
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la suppression du template.')
    }
  }

  async function duplicateTemplate(id: string) {
    try {
      const { data } = await apiClient.post(`/quote-templates/${id}/duplicate`)
      return QuoteTemplateSchema.parse(data)
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la duplication du template.')
    }
  }

  return {
    templates,
    currentTemplate,
    isLoading,
    fetchAllTemplates,
    fetchTemplate,
    fetchDefaultTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate
  }
})
