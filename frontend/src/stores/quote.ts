import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/config/axios';
import { handleError } from '@/utils/handleError';
import { QuoteSchema, type CreateQuote, type Quote } from '@/schemas/quote.schema';

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
      handleError(error, 'Erreur lors de la récupération de la devis.');
    } finally {
      isLoading.value = false;
    }
  }

  async function createQuote(payload: CreateQuote) {
    try {
      const { data } = await apiClient.post('/quotes', payload);
      console.log(
        'types avant parse:',
        data.variableValues.map((v: any) => [typeof v.type, v.type])
      );
      console.log('data', data);
      
      return QuoteSchema.parse(data);
    } catch (error) {
       console.error('❌ Erreur de validation Zod:', error);
      handleError(error, 'Erreur lors de la création de la devis.');
    }
  }

  async function deleteQuote(id: string) {
    try {
      await apiClient.delete(`/quotes/${id}`);
      quotes.value = quotes.value.filter((quote) => quote.id !== id);
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression de la devis.');
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
  
  return {
    quotes,
    currentQuote,
    isLoading,
    fetchAllQuotes,
    fetchQuote,
    createQuote,
    deleteQuote, 
    fetchNextQuoteNumber 
  };
});
