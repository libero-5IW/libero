import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/config/axios';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { InvoiceSchema, type Invoice } from '@/schemas/invoice.schema';

export const useInvoiceStore = defineStore('invoice', () => {
  const invoices = ref<Invoice[]>([]);
  const currentInvoice = ref<Invoice | null>(null);
  const isLoading = ref(false);

  async function fetchAllInvoices() {
    isLoading.value = true;
    try {
      const { data } = await apiClient.get('/invoices');
      invoices.value = data.map((item: Invoice) => InvoiceSchema.parse(item));
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la récupération des factures.');
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
      handleAxiosError(error, 'Erreur lors de la récupération de la facture.');
    } finally {
      isLoading.value = false;
    }
  }

  async function createInvoice(payload: any) {
    try {
      const { data } = await apiClient.post('/invoices', payload);
      return InvoiceSchema.parse(data);
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la création de la facture.');
    }
  }

  async function deleteInvoice(id: string) {
    try {
      await apiClient.delete(`/invoices/${id}`);
      invoices.value = invoices.value.filter((invoice) => invoice.id !== id);
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la suppression de la facture.');
    }
  }

  async function fetchNextInvoiceNumber() {
    try {
      const { data } = await apiClient.get('/invoices/next-number');
      return data.nextNumber;  
    } catch (error) {
      handleAxiosError(error, 'Erreur lors de la récupération du numéro de facture.');
      return null;
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
    fetchNextInvoiceNumber 
  };
});
