import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/config/axios';
import { handleError } from '@/utils/handleError';
import { QuoteSchema, type Quote, type CreateQuote } from '@/schemas/quote.schema';
import { ClientSchema } from '@/schemas/client.schema';

export const useQuoteStore = defineStore('quote', () => {
  const quotes = ref<Quote[]>([]);
  const currentQuote = ref<Quote | null>(null);
  const isLoading = ref(false);

  async function fetchAllQuotes() {
    isLoading.value = true;
    try {
      const { data } = await apiClient.get('/quotes');
      quotes.value = data.map((item: Quote) => QuoteSchema.parse(item)); 
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

  async function searchQuotes(search: string, status?: string | null) {
    isLoading.value = true;
    try {
      const { data } = await apiClient.get('/quotes/search', {
        params: {
          term: search,
          ...(status ? { status } : {})
        }
      });
      quotes.value = data.map((item: Quote) => QuoteSchema.parse(item));
    } catch (error) {
      handleError(error, 'Erreur lors de la recherche des devis.');
    } finally {
      isLoading.value = false;
    }
  } 

  async function changeStatus(id: string, newStatus: string) {
    isLoading.value = true;
    try {
      const { data } = await apiClient.patch(`/quotes/${id}/change-status`, { newStatus } );
      console.log('data', data);
      
      return QuoteSchema.parse(data);
    } catch (error) {
      handleError(error, 'Erreur lors du changement vers le nouveau statut.');
    } finally {
      isLoading.value = false;
    }
  }
  
  async function sentQuoteToClient(id: string) {
    isLoading.value = true;
    try {
      const { data } = await apiClient.patch(`/quotes/${id}/send`);
      return ClientSchema.parse(data);
    } catch (error) {
      handleError(error, 'Erreur lors de l’envoi du devis au client.');
    } finally {
      isLoading.value = false;
    }
  }

  return {
    quotes,
    currentQuote,
    isLoading,
    fetchAllQuotes,
    fetchQuote,
    createQuote,
    deleteQuote,
    fetchNextQuoteNumber,
    updateQuote,
    searchQuotes,
    sentQuoteToClient,
    changeStatus
  };
});
