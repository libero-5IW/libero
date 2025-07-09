import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/config/axios';
import { handleError } from '@/utils/handleError';
import { InvoiceSchema, type Invoice, type CreateInvoice } from '@/schemas/invoice.schema';

export const useInvoiceStore = defineStore('invoice', () => {
  const invoices = ref<Invoice[]>([]);
  const currentInvoice = ref<Invoice | null>(null);
  const isLoading = ref(false);

  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(9);

  async function fetchAllInvoices() {
    isLoading.value = true;
    try {
      const { data } = await apiClient.get('/invoices');
      invoices.value = data.map((item: Invoice) => InvoiceSchema.parse(item));
      total.value = data.length;
      currentPage.value = 1;
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération des factures.');
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchInvoice(id: string) {
    isLoading.value = true;
    try {
      const { data } = await apiClient.get(`/invoices/${id}`);
      currentInvoice.value = InvoiceSchema.parse(data);
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération de la facture.');
    } finally {
      isLoading.value = false;
    }
  }

  async function createInvoice(payload: CreateInvoice) {
    try {
      const { data } = await apiClient.post('/invoices', payload);
      return InvoiceSchema.parse(data);
    } catch (error) {
      handleError(error, 'Erreur lors de la création de la facture.');
    } finally {
      isLoading.value = false; 
    }  
  }

  async function deleteInvoice(id: string) {
    try {
      isLoading.value = true;
      await apiClient.delete(`/invoices/${id}`);
      invoices.value = invoices.value.filter((invoice) => invoice.id !== id);
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression de la facture.');
    } finally {
      isLoading.value = false;   
    }
  }

  async function fetchNextInvoiceNumber() {
    try {
      const { data } = await apiClient.get('/invoices/next-number');
      return data;
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération du numéro de facture.');
      return null;
    }
  }  

  async function updateInvoice(id: string, payload: Partial<Invoice>) {
    try {
      isLoading.value = true;
      const { data } = await apiClient.put(`/invoices/${id}`, payload);
      return InvoiceSchema.parse(data);
    } catch (error) {
      handleError(error, 'Erreur lors de la modification de la facture.');
    } finally {
      isLoading.value = false;      
    }
  }  

  async function searchInvoices(
    search: string,
    status?: string | null,
    startDate?: string | null,
    endDate?: string | null,
    page = 1,
    size = pageSize.value
  )
   {
    isLoading.value = true;
    try {
      const { data } = await apiClient.get('/invoices/search', {
        params: {
          term: search,
          ...(status ? { status } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
          page,
          pageSize: size,
        },
      });
      invoices.value = data.data.map((item: Invoice) => InvoiceSchema.parse(item));
      total.value = data.total;
      currentPage.value = page;
      } catch (error) {
      handleError(error, 'Erreur lors de la recherche des factures.');
    } finally {
      isLoading.value = false;
    }
  }  
  
  return {
    invoices,
    currentInvoice,
    isLoading,
    fetchAllInvoices,
    fetchInvoice,
    createInvoice,
    deleteInvoice, 
    fetchNextInvoiceNumber,
    updateInvoice,
    searchInvoices,
    total,
    currentPage,
    pageSize, 
  };
});
