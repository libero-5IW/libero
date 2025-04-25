import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/config/axios'
import { removeSystemVariables } from '@/utils/removeSystemVariables'
import { InvoiceTemplateSchema, type InvoiceTemplate } from '@/schemas/invoiceTemplate.schema'
import { handleAxiosError } from '@/utils/handleAxiosError'

export const useInvoiceTemplateStore = defineStore('invoiceTemplate', () => {
  const templates = ref<InvoiceTemplate[]>([])
  const currentTemplate = ref<InvoiceTemplate | null>(null)
  const isLoading = ref(false)

  async function fetchAllTemplates() {
    isLoading.value = true
    try {
      const { data } = await apiClient.get('/invoice-templates')
      templates.value = data.map((item: InvoiceTemplate) => InvoiceTemplateSchema.parse(item))
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la récupération des templates.')
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
      handleAxiosError(error, 'Erreur lors de la récupération du template.')
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDefaultTemplate() {
    try {
      const { data } = await apiClient.get('/invoice-templates/default-template')
      return InvoiceTemplateSchema.parse(data)
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la récupération du template par défaut.')
    }
  }

  async function createTemplate(payload: InvoiceTemplate) {
    try {
      const cleanedPayload = removeSystemVariables(payload)
      const { data } = await apiClient.post('/invoice-templates', cleanedPayload)
      return InvoiceTemplateSchema.parse(data)
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la création du template.')
    }
  }

  async function updateTemplate(id: string, payload: Partial<InvoiceTemplate>) {
    try {
      const cleanedPayload = removeSystemVariables(payload)
      const { data } = await apiClient.patch(`/invoice-templates/${id}`, cleanedPayload)
      return InvoiceTemplateSchema.parse(data)
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la mise à jour du template.')
    }
  }

  async function deleteTemplate(id: string) {
    try {
      await apiClient.delete(`/invoice-templates/${id}`)
      templates.value = templates.value.filter((template) => template.id !== id)
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la suppression du template.')
    }
  }

  async function duplicateTemplate(id: string) {
    try {
      const { data } = await apiClient.post(`/invoice-templates/${id}/duplicate`)
      return InvoiceTemplateSchema.parse(data)
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
