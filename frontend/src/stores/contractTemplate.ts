import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/config/axios'
import { removeSystemVariables } from '@/utils/removeSystemVariables'
import { handleError } from '@/utils/handleError'
import { ContractTemplateSchema, type CreateContractTemplate, type ContractTemplate } from '@/schemas/contractTemplate.schema'

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
      handleError(error, 'Erreur lors de la récupération des templates de contrat.')
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
      handleError(error, 'Erreur lors de la récupération du template de contrat.')
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDefaultTemplate() {
    isLoading.value = true
    try {
      const { data } = await apiClient.get('/contract-templates/default-template')
      defaultTemplate.value = ContractTemplateSchema.parse(data)
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération du template par défaut de contrat.')
    } finally {
      isLoading.value = false
    }
  }

  async function createTemplate(payload: CreateContractTemplate) {
    isLoading.value = true
    try {
      const cleanedPayload = removeSystemVariables(payload)
      const { data } = await apiClient.post('/contract-templates', cleanedPayload)
      return ContractTemplateSchema.parse(data)
    } catch (error) {
      handleError(error, 'Erreur lors de la création du template de contrat.')
    } finally {
      isLoading.value = false
    }
  }

  async function updateTemplate(id: string, payload: Partial<ContractTemplate>) {
    isLoading.value = true
    try {
      const cleanedPayload = removeSystemVariables(payload)
      const { data } = await apiClient.patch(`/contract-templates/${id}`, cleanedPayload)
      return ContractTemplateSchema.parse(data)
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour du template de contrat.')
    } finally {
      isLoading.value = false
    }
  }

  async function deleteTemplate(id: string) {
    isLoading.value = true
    try {
      await apiClient.delete(`/contract-templates/${id}`)
      templates.value = templates.value.filter((template) => template.id !== id)
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression du template de contrat.')
    } finally {
      isLoading.value = false
    }
  }

  async function duplicateTemplate(id: string) {
    isLoading.value = true
    try {
      const { data } = await apiClient.post(`/contract-templates/${id}/duplicate`)
      return ContractTemplateSchema.parse(data)
    } catch (error) {
      handleError(error, 'Erreur lors de la duplication du template de contrat.')
    } finally {
      isLoading.value = false
    }
  }

  async function searchTemplates(term: string) {
    isLoading.value = true
    try {
      const { data } = await apiClient.get(`/contract-templates/search/${encodeURIComponent(term)}`)
      templates.value = data.map((item: ContractTemplate) => ContractTemplateSchema.parse(item))
    } catch (error) {
      templates.value = []
      handleError(error, 'Erreur lors de la recherche des templates de contrat.')
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
