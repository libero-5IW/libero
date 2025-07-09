import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/config/axios';
import { handleError } from '@/utils/handleError';
import { QuoteSchema, type Quote, type CreateQuote } from '@/schemas/quote.schema';

export const useQuoteStore = defineStore('quote', () => {
  const quotes = ref<Quote[]>([]);
  const currentQuote = ref<Quote | null>(null);
  const isLoading = ref(false);

  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(9); 

  async function fetchAllQuotes() {
    isLoading.value = true;
    try {
      const { data } = await apiClient.get('/quotes');
      quotes.value = data.map((item: Quote) => QuoteSchema.parse(item));
      total.value = data.length; 
      currentPage.value = 1;
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération des devis.');
    } finally {
      isLoading.value = false;
    }
  }
  
  async function fetchQuote(id: string) {
    isLoading.value = true;
    try {
      const { data } = await apiClient.get(`/quotes/${id}`);
      currentQuote.value = QuoteSchema.parse(data);
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération du devis.');
    } finally {
      isLoading.value = false;
    }
  }

  async function createQuote(payload: CreateQuote) {
    try {
      isLoading.value = true;
      const { data } = await apiClient.post('/quotes', payload);
      const test = QuoteSchema.parse(data);
      return test;
    } catch (error) {
      handleError(error, 'Erreur lors de la création du devis.');
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteQuote(id: string) {
    try {
      isLoading.value = true;
      await apiClient.delete(`/quotes/${id}`);
      quotes.value = quotes.value.filter((quote) => quote.id !== id);
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression du devis.');
    } finally {
      isLoading.value = false;      
    }
  }

  async function fetchNextQuoteNumber() {
    try {
      const { data } = await apiClient.get('/quotes/next-number');
      return data;
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération du numéro de devis.');
      return null;
    }
  }

  async function updateQuote(id: string, payload: Partial<Quote>) {
    try {
      isLoading.value = true;
      const { data } = await apiClient.put(`/quotes/${id}`, payload);
      return QuoteSchema.parse(data);
    } catch (error) {
      handleError(error, 'Erreur lors de la modification du devis.');
    } finally {
      isLoading.value = false;
    }
  }

  async function searchQuotes(
    search: string,
    status?: string | null,
    startDate?: string | null,
    endDate?: string | null,
    page = 1,
    size = pageSize.value
  ) {
    isLoading.value = true;
    try {
      const { data } = await apiClient.get('/quotes/search', {
        params: {
          term: search,
          ...(status ? { status } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
          page,
          pageSize: size,
        },
      });
  
      quotes.value = data.quote.map((item: Quote) => QuoteSchema.parse(item));
      total.value = data.total;
      currentPage.value = page;
    } catch (error) {
      handleError(error, 'Erreur lors de la recherche des devis.');
    } finally {
      isLoading.value = false;
    }
  }

  return {
    quotes,
    currentQuote,
    isLoading,
    fetchAllQuotes,
    total,         
    currentPage,    
    pageSize,
    fetchQuote,
    createQuote,
    deleteQuote,
    fetchNextQuoteNumber,
    updateQuote,
    searchQuotes
  };
});
