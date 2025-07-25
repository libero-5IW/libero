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

  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(9)

  async function fetchAllTemplates(includeDefault = true) {
    isLoading.value = true
    try {
      const { data } = await apiClient.get('/invoice-templates', {
        params: { includeDefault },
      })
      templates.value = data.map((item: InvoiceTemplate) => InvoiceTemplateSchema.parse(item))
      total.value = data.length
      currentPage.value = 1
    } catch (error) {
      console.error('error', error)
      templates.value = []
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
    isLoading.value = true
    try {
      const { data } = await apiClient.get('/invoice-templates/default-template')
      defaultTemplate.value = InvoiceTemplateSchema.parse(data)
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération du template par défaut.')
    } finally {
      isLoading.value = false
    }
  }

  async function createTemplate(payload: CreateInvoiceTemplate) {
    isLoading.value = true
    try {
      const cleanedPayload = removeSystemVariables(payload)
      const { data } = await apiClient.post('/invoice-templates', cleanedPayload)
      return InvoiceTemplateSchema.parse(data)
    } catch (error) {
      handleError(error, 'Erreur lors de la création du template.')
    } finally {
      isLoading.value = false
    }
  }
  
  async function updateTemplate(id: string, payload: Partial<InvoiceTemplate>) {
    isLoading.value = true
    try {
      const cleanedPayload = removeSystemVariables(payload)
      const { data } = await apiClient.patch(`/invoice-templates/${id}`, cleanedPayload)
      return InvoiceTemplateSchema.parse(data)
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour du template.')
    } finally {
      isLoading.value = false
    }
  }    

  async function deleteTemplate(id: string) {
    isLoading.value = true
    try {
      await apiClient.delete(`/invoice-templates/${id}`)
      templates.value = templates.value.filter((template) => template.id !== id)
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression du template.')
    } finally {
      isLoading.value = false
    }
  }

  async function duplicateTemplate(id: string) {
    isLoading.value = true
    try {
      const { data } = await apiClient.post(`/invoice-templates/${id}/duplicate`)
      return InvoiceTemplateSchema.parse(data)
    } catch (error) {
      handleError(error, 'Erreur lors de la duplication du template.')
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
      const { data } = await apiClient.get(`/invoice-templates/search`, {
        params: {
          term,
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
          page,
          pageSize: size
        }
      })
      templates.value = data.invoiceTemplate.map((item: InvoiceTemplate) =>
        InvoiceTemplateSchema.parse(item)
      )
      total.value = data.total
      currentPage.value = page
    } catch (error) {
      templates.value = []
      handleError(error, 'Erreur lors de la recherche des templates.')
    } finally {
      isLoading.value = false
    }
  }  

  async function exportInvoiceTemplates(
    term = '',
    startDate?: string,
    endDate?: string
  ) {
    try {
      const response = await apiClient.get('/invoice-templates/export', {
        params: {
          term,
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        },
        responseType: 'blob',
      });
  
      const disposition = response.headers?.['content-disposition'];
      const match = disposition?.match(/filename="(.+)"/);
      const filename = match?.[1] ?? `invoice_templates_export_${Date.now()}.csv`;
  
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      handleError(error, 'Erreur lors de l’export CSV des templates de facture.');
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
    exportInvoiceTemplates
  }
})
