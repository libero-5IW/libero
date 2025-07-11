import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/config/axios';
import { handleError } from '@/utils/handleError';
import {
  ContractSchema,
  type Contract,
  type CreateContract,
} from '@/schemas/contract.schema';
import { ClientSchema } from '@/schemas/client.schema';

export const useContractStore = defineStore('contract', () => {
  const contracts = ref<Contract[]>([]);
  const currentContract = ref<Contract | null>(null);
  const isLoading = ref(false);

  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(9);

  async function fetchAllContracts() {
    isLoading.value = true;
    try {
      const { data } = await apiClient.get('/contracts');
      contracts.value = data.map((item: Contract) => ContractSchema.parse(item));
      total.value = data.length;
      currentPage.value = 1;
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

  async function searchContracts(
    search: string,
    status?: string | null,
    startDate?: string | null,
    endDate?: string | null,
    page = 1,
    size = pageSize.value
  ) {
    isLoading.value = true;
    try {
      const { data } = await apiClient.get('/contracts/search', {
        params: {
          term: search,
          ...(status ? { status } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
          page,
          pageSize: size,
        },
      });
      contracts.value = data.contract.map((item: Contract) => ContractSchema.parse(item));
      total.value = data.total;
      currentPage.value = page;
    } catch (error) {
      handleError(error, 'Erreur lors de la recherche des contrats.');
    } finally {
      isLoading.value = false;
    }
  } 

  async function exportContracts(
    term = '',
    status?: string,
    startDate?: string,
    endDate?: string
  ) {
    try {
      const response = await apiClient.get('/contracts/export', {
        params: {
          term,
          ...(status ? { status } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        },
        responseType: 'blob',
      });
  
      const disposition = response.headers?.['content-disposition'];
      const match = disposition?.match(/filename="(.+)"/);
      const filename = match?.[1] ?? `contrats_export_${Date.now()}.csv`;
  
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      handleError(error, 'Erreur lors de l’export CSV.');
    }
  }  

  async function changeStatus(id: string, newStatus: string) {
    isLoading.value = true;
    try {
      const { data } = await apiClient.patch(`/contracts/${id}/change-status`, { newStatus } );
      return ContractSchema.parse(data);
    } catch (error) {
      handleError(error, 'Erreur lors du changement vers le nouveau statut.');
    } finally {
      isLoading.value = false;
    }
  }
  
  async function sendContractForSignature(id: string) {
    isLoading.value = true;
    try {
      const { data } = await apiClient.patch(`/contracts/${id}/signature`);
      return ClientSchema.parse(data);
    } catch (error) {
      handleError(error, 'Erreur lors de l’envoi du contrat au client.');
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
    searchContracts,
    changeStatus,
    sendContractForSignature,
    total,
    currentPage,
    pageSize,
    exportContracts
  };
});
