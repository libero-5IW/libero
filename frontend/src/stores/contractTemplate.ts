import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/config/axios'
import { removeSystemVariables } from '@/utils/removeSystemVariables'
import { ContractTemplateSchema, type CreateContractTemplate, type ContractTemplate } from '@/schemas/contractTemplate.schema'
import { handleAxiosError } from '@/utils/handleAxiosError'

export const useContractTemplateStore = defineStore('contractTemplate', () => {
  const templates = ref<ContractTemplate[]>([])
  const currentTemplate = ref<ContractTemplate | null>(null)
  const defaultTemplate = ref<ContractTemplate | null>(null)
  const isLoading = ref(false)

  async function fetchAllTemplates(includeDefault = true) {
    isLoading.value = true
    try {
      const { data } = await apiClient.get('/contract-templates', {
        params: { includeDefault },
      })
      templates.value = data.map((item: ContractTemplate) => ContractTemplateSchema.parse(item))
    } catch (error) {
      templates.value = []
      handleAxiosError(error, 'Erreur lors de la récupération des templates.')
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTemplate(id: string) {
    isLoading.value = true
    try {
      const { data } = await apiClient.get(`/contract-templates/${id}`)
      currentTemplate.value = ContractTemplateSchema.parse(data)
    } catch (error) {
      currentTemplate.value = null
      handleAxiosError(error, 'Erreur lors de la récupération du template.')
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDefaultTemplate() {
    try {
      const { data } = await apiClient.get('/contract-templates/default-template')
      defaultTemplate.value = ContractTemplateSchema.parse(data)
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la récupération du template par défaut.')
    }
  }

  async function createTemplate(payload: CreateContractTemplate) {
    try {
      const cleanedPayload = removeSystemVariables(payload)
      const { data } = await apiClient.post('/contract-templates', cleanedPayload)
      return ContractTemplateSchema.parse(data)
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la création du template.')
    }
  }

  async function updateTemplate(id: string, payload: Partial<ContractTemplate>) {
    try {
      const cleanedPayload = removeSystemVariables(payload)
      const { data } = await apiClient.patch(`/contract-templates/${id}`, cleanedPayload)
      return ContractTemplateSchema.parse(data)
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la mise à jour du template.')
    }
  }

  async function deleteTemplate(id: string) {
    try {
      await apiClient.delete(`/contract-templates/${id}`)
      templates.value = templates.value.filter((template) => template.id !== id)
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la suppression du template.')
    }
  }

  async function duplicateTemplate(id: string) {
    try {
      const { data } = await apiClient.post(`/contract-templates/${id}/duplicate`)
      return ContractTemplateSchema.parse(data)
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la duplication du template.')
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
  }
})
