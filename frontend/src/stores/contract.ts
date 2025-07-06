import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/config/axios';
import { handleError } from '@/utils/handleError';
import {
  ContractSchema,
  type Contract,
  type CreateContract,
} from '@/schemas/contract.schema';

export const useContractStore = defineStore('contract', () => {
  const contracts = ref<Contract[]>([]);
  const currentContract = ref<Contract | null>(null);
  const isLoading = ref(false);

  async function fetchAllContracts() {
    isLoading.value = true;
    try {
      const { data } = await apiClient.get('/contracts');
      console.log('dataa', data);
      
      contracts.value = data.map((item: Contract) => ContractSchema.parse(item));
      console.log('contracts', contracts.value);
      
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération des contrats.');
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchContract(id: string) {
    isLoading.value = true;
    try {
      const { data } = await apiClient.get(`/contracts/${id}`);
      currentContract.value = ContractSchema.parse(data);
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération du contrat.');
    } finally {
      isLoading.value = false;
    }
  }

  async function createContract(payload: CreateContract) {
    try {
      isLoading.value = true;
      const { data } = await apiClient.post('/contracts', payload);
      return ContractSchema.parse(data);
    } catch (error) {
      handleError(error, 'Erreur lors de la création du contrat.');
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteContract(id: string) {
    try {
      isLoading.value = true;
      await apiClient.delete(`/contracts/${id}`);
      contracts.value = contracts.value.filter((contract) => contract.id !== id);
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression du contrat.');
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchNextContractNumber() {
    try {
      const { data } = await apiClient.get('/contracts/next-number');
      return data;
    } catch (error) {
      handleError(error, 'Erreur lors de la récupération du numéro de contrat.');
      return null;
    }
  }

  async function updateContract(id: string, payload: Partial<Contract>) {
    try {
      isLoading.value = true;
      const { data } = await apiClient.put(`/contracts/${id}`, payload);
      return ContractSchema.parse(data);
    } catch (error) {
      handleError(error, 'Erreur lors de la modification du contrat.');
    } finally {
      isLoading.value = false;
    }
  }

  async function searchContracts(search: string) {
    isLoading.value = true;
    try {
      const { data } = await apiClient.get(`/contracts/search/${search}`);
      contracts.value = data.map((item: Contract) => ContractSchema.parse(item));
    } catch (error) {
      handleError(error, 'Erreur lors de la recherche des contrats.');
    } finally {
      isLoading.value = false;
    }
  }  

  return {
    contracts,
    currentContract,
    isLoading,
    fetchAllContracts,
    fetchContract,
    createContract,
    deleteContract,
    fetchNextContractNumber,
    updateContract,
    searchContracts
  };
});
