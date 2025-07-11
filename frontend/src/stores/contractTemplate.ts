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

  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(9)

  async function fetchAllTemplates(includeDefault = true) {
    isLoading.value = true
    try {
      const { data } = await apiClient.get('/contract-templates', {
        params: { includeDefault },
      })
      templates.value = data.map((item: ContractTemplate) => ContractTemplateSchema.parse(item))
      total.value = data.length
      currentPage.value = 1
    } catch (error) {
      templates.value = []
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
      currentTemplate.value = null
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

  async function searchTemplates(
    term: string,
    startDate?: string | null,
    endDate?: string | null,
    page = 1,
    size = pageSize.value
  ) {
    isLoading.value = true
    try {
      const { data } = await apiClient.get(`/contract-templates/search`, {
        params: {
          term,
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
          page,
          pageSize: size,
        },
      })
      templates.value = data.contractTemplate.map((item: ContractTemplate) =>
        ContractTemplateSchema.parse(item)
      )
      total.value = data.total
      currentPage.value = page
    } catch (error) {
      templates.value = []
      handleError(error, 'Erreur lors de la recherche des templates de contrat.')
    } finally {
      isLoading.value = false
    }
  }  

  async function exportContractTemplates(
    term = '',
    startDate?: string,
    endDate?: string
  ) {
    try {
      const response = await apiClient.get('/contract-templates/export', {
        params: {
          term,
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        },
        responseType: 'blob',
      });
  
      const disposition = response.headers?.['content-disposition'];
      const match = disposition?.match(/filename="(.+)"/);
      const filename = match?.[1] ?? `contract_templates_export_${Date.now()}.csv`;
  
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      handleError(error, 'Erreur lors de l’export CSV des templates de contrat.');
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
    searchTemplates,
    total,
    currentPage,
    pageSize,
    exportContractTemplates
  }
})
