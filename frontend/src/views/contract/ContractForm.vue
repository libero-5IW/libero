<template>
    <TemplateSelectionModal
      v-model="showTemplateModal"
      :fetchTemplates="fetchContractTemplates"
      :isForced="!isEditMode"
      @templateSelected="handleTemplateSelected"
    />
  
    <div v-if="selectedTemplateId">
      <v-container fluid>
        <v-row dense>
          <v-col cols="12" md="8">
            <v-text-field
              :model-value="currentTemplate?.name ?? 'Template inconnu'"
              label="Template utilisé"
              readonly
              class="mb-6"
            />
  
            <v-text-field
              v-if="contractNumberVariable"
              :model-value="contractNumberVariable.value"
              :label="contractNumberVariable.label || 'Numéro du contrat'"
              readonly
              class="mb-4"
              :style="{ pointerEvents: 'none', opacity: 0.6 }"
            />
  
            <v-card flat class="mb-4 pa-4">
              <TemplateVariableSection
                title="Informations du Freelance"
                :variables="freelancerVariables"
                :variablesValue="variablesValue"
              />
              <TemplateVariableSection
                title="Informations du Client"
                :variables="clientVariables"
                :variablesValue="variablesValue"
                :clients="clients"
                v-model:selectedClientId="selectedClientId"
              />
              <TemplateVariableSection
                title="Autres Informations"
                :variables="otherVariables"
                :variablesValue="variablesValue"
              />
  
              <v-btn
                v-if="!isEditMode"
                color="primary"
                @click="onCreateContract"
                :disabled="!canCreate"
              >
                <v-icon start>mdi-content-save</v-icon>
                Créer le contrat
              </v-btn>

              <v-btn
                v-else
                color="primary"
                @click="onUpdateContract"
              >
                <v-icon start>mdi-content-save</v-icon>
                Enregistrer
              </v-btn>
            </v-card>
          </v-col>
  
          <v-col cols="12" md="4">
            <InvoiceTemplatePreview
              :contentHtml="previewHtml"
              :variables="previewVariables"
              fileName="contrat"
            />
          </v-col>
        </v-row>
      </v-container>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useContractTemplateStore } from '@/stores/contractTemplate';
  import { useContractStore } from '@/stores/contract';
  import { useClientStore } from '@/stores/client';
  import { useUserStore } from '@/stores/user';
  import TemplateSelectionModal from '@/components/Modals/TemplateSelectionModal.vue';
  import TemplateVariableSection from '@/components/DocumentForm/TemplateVariableSection.vue';
  import InvoiceTemplatePreview from '@/components/ui/PreviewPdf.vue';
  import { useToastHandler } from '@/composables/useToastHandler';
  import { mapTemplateVariables } from '@/utils/mapTemplateVariables';
  import type { VariableValue, VariableType } from '@/types';
  import type { ContractTemplateVariable } from '@/schemas/contractTemplate.schema';
  import { CONTRACT_STATUS } from '@/constants/status/contract-status.constant';
  import { extractUsedVariableNames } from '@/utils/extractUsedVariables';

  
  const route = useRoute();
  const router = useRouter();
  
  const contractTemplateStore = useContractTemplateStore();
  const contractStore = useContractStore();
  const clientStore = useClientStore();
  const userStore = useUserStore();
  const { showToast } = useToastHandler();
  
  const showTemplateModal = ref(false);
  const selectedTemplateId = ref<string | null>(null);
  const selectedClientId = defineModel<string>('selectedClientId');
  const previewHtml = ref('');
  const templateVariables = ref<ContractTemplateVariable[]>([]);
  const variablesValue = ref<VariableValue[]>([]);
  const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;
  const contractId = computed(() => route.params.id as string | undefined);
  const isEditMode = computed(() => !!contractId.value);
  
  const currentUser = computed(() => userStore.user);
  const currentTemplate = computed(() => contractTemplateStore.currentTemplate);
  const clients = computed(() => clientStore.clients);
  const contractNumberVariable = computed(() =>
    variablesValue.value.find((v) => v.variableName === 'contract_number')
  );
  const previewVariables = computed(() => {
    const result: Record<string, string> = {};
    variablesValue.value.forEach(v => {
      result[v.variableName] = v.value || `<em class="text-gray-500">${v.label}</em>`;
    });
    return result;
  });
  
  onMounted(initialize);
  
  async function initialize() {
  const templateIdFromQuery = route.query.templateId as string | undefined;
  const templateId = selectedTemplateId.value || templateIdFromQuery;

  await clientStore.fetchAllClients();

  if (!templateId && !isEditMode.value) {
    showTemplateModal.value = true;
    return;
  }

  if (isEditMode.value && contractId.value) {
    await contractStore.fetchContract(contractId.value);
    const contract = contractStore.currentContract;

    if (contract) {
      selectedClientId.value = contract.clientId;
      selectedTemplateId.value = contract.templateId ?? null;
      previewHtml.value = contract.generatedHtml;

      variablesValue.value = contract.variableValues.map(v => ({
        id: v.id,
        variableName: v.variableName,
        value: v.value,
        label: v.label,
        type: v.type,
        required: v.required,
        contractId: contract.id,
      }));

      if (contract.templateId) {
        await contractTemplateStore.fetchTemplate(contract.templateId);
        await handleTemplateSelected(contract.templateId);
      }

      return;
    }
  }

  if (templateId) {
    await contractTemplateStore.fetchTemplate(templateId);

    if (!contractTemplateStore.currentTemplate) {
      showTemplateModal.value = true;
      return;
    }

    selectedTemplateId.value = templateId;
    await handleTemplateSelected(templateId);
  } else if (!isEditMode.value) {
    showTemplateModal.value = true;
  }
}
  
  async function fetchContractTemplates() {
    await contractTemplateStore.fetchAllTemplates();
    return contractTemplateStore.templates.map(t => ({
      id: t.id!,
      name: t.name,
    }));
  }
  
  async function handleTemplateSelected(templateId: string) {
  selectedTemplateId.value = templateId;
  const template = await loadAndGetTemplate(templateId);
  if (!template) return;

  const usedVariableNames = extractUsedVariableNames(template.contentHtml)

  const filtered = template.variables.filter(
    (v, i, arr) =>
      usedVariableNames.includes(v.variableName) && 
      arr.findIndex(x => x.variableName === v.variableName) === i
  )

  templateVariables.value = mapTemplateVariablesWithEnum(filtered);
  previewHtml.value = template.contentHtml;
  resetVariableValues(filtered);
  await fillSystemValues(filtered);
}

  
  async function loadAndGetTemplate(templateId: string) {
    await contractTemplateStore.fetchTemplate(templateId);
    return contractTemplateStore.currentTemplate;
  }
  
  function mapTemplateVariablesWithEnum(variables: ContractTemplateVariable[]) {
    return mapTemplateVariables(
      variables.map((v) => ({ ...v, type: v.type as VariableType }))
    );
  }
  
  function resetVariableValues(variables: ContractTemplateVariable[]) {
    const valueMap = new Map<string, string>(
      variablesValue.value.map(v => [v.variableName, v.value])
    );
  
    variablesValue.value = variables.map(v => ({
      variableName: v.variableName,
      label: v.label,
      type: v.type as VariableType,
      required: v.required,
      value: valueMap.get(v.variableName) ?? '',
      id: v.id,
      templateId: v.templateId,
    }));
  }
  
  async function fillSystemValues(variables: ContractTemplateVariable[]) {
    if (!currentUser.value?.id) {
      await userStore.fetchCurrentUser();
    }
  
    const user = currentUser.value;
    if (!user) return;
  
    if (variables.some(v => v.variableName === 'contract_number')) {
      const nextNumber = await contractStore.fetchNextContractNumber?.();
      if (nextNumber) updateVariable('contract_number', `${nextNumber}`);
    }
  
    updateVariable('freelancer_name', `${user.firstName} ${user.lastName}`);
    updateVariable('freelancer_address', `${user.addressLine}, ${user.postalCode} ${user.city}, ${user.country}`);
    updateVariable('freelancer_siret', user.siret ?? '');
  
    const today = new Date().toISOString().split('T')[0];
    updateVariable('start_date', today);
    updateVariable('contract_terms', 'Contrat à durée déterminée');
  }
  
  function updateVariable(name: string, newValue: string) {
    const v = variablesValue.value.find(v => v.variableName === name);
    if (v) v.value = newValue;
  }
  
  const canCreate = computed(() => {
    const hasTemplate = !!selectedTemplateId.value;
    const hasClient = !!selectedClientId.value;
    const hasUser = !!currentUser.value;
    const allRequiredFilled = templateVariables.value.every(v =>
      !v.required || !!variablesValue.value.find(val => val.variableName === v.variableName)?.value
    );
  
    return hasTemplate && hasClient && hasUser && allRequiredFilled;
  });
  
  const orderedTemplateVariables = computed(() => {
    return [...templateVariables.value].sort((a, b) => {
      const indexA = previewHtml.value.indexOf(`{{${a.variableName}}}`);
      const indexB = previewHtml.value.indexOf(`{{${b.variableName}}}`);
      return indexA - indexB;
    });
  });
  
  const freelancerVariables = computed(() =>
    orderedTemplateVariables.value.filter(v => v.variableName.startsWith('freelancer_'))
  );
  const clientVariables = computed(() =>
    orderedTemplateVariables.value.filter(v => v.variableName.startsWith('client_'))
  );
  const otherVariables = computed(() =>
    orderedTemplateVariables.value.filter(v =>
      !v.variableName.startsWith('freelancer_') &&
      !v.variableName.startsWith('client_') &&
      v.variableName !== 'contract_number'
    )
  );
  
  watch(selectedClientId, (newClientId) => {
    const client = clients.value.find(c => c.id === newClientId);
    if (!client) return;
    updateVariable('client_name', `${client.firstName} ${client.lastName}`);
    updateVariable('client_address', `${client.addressLine}, ${client.postalCode} ${client.city}, ${client.country}`);
  });
  
  async function onCreateContract() {
    const user = currentUser.value;
    if (!user) {
      showToast('error', 'Utilisateur non chargé !');
      return;
    }
  
    const missingFields = templateVariables.value.filter(
      v =>
        v.required &&
        !variablesValue.value.find(val => val.variableName === v.variableName)?.value
    );
  
    if (missingFields.length > 0) {
      showToast('error', `Veuillez remplir tous les champs obligatoires : ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }
  
    if (!selectedTemplateId.value) {
      showToast('error', 'Vous n\'avez pas sélectionné de template de contrat');
      return;
    }
  
    const payload = {
      templateId: selectedTemplateId.value,
      clientId: selectedClientId.value!,
      status: CONTRACT_STATUS.DRAFT,
      issuedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + THIRTY_DAYS_IN_MS).toISOString(),
      variableValues: variablesValue.value.map(v => ({
        variableName: v.variableName,
        value: v.value,
      })),
      generatedHtml: previewHtml.value,
    };

  
    const contract = await contractStore.createContract(payload);
  
    if (contract) {
      router.push({
        path: '/contract',
        state: {
          toastStatus: 'success',
          toastMessage: `Le contrat #${contract.number} a été créé avec succès.`,
        },
      });
    }
  }

  async function onUpdateContract() {
    if (!contractId.value) return;

    const payload = {
      templateId: selectedTemplateId.value!,
      clientId: selectedClientId.value!,
      issuedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + THIRTY_DAYS_IN_MS).toISOString(),
      generatedHtml: previewHtml.value,
      variableValues: variablesValue.value.map(v => ({
        id: v.id!,
        variableName: v.variableName,
        value: v.value,
        label: v.label,
        type: v.type,
        required: v.required,
        contractId: contractId.value!,
      })),
    };

    const updated = await contractStore.updateContract(contractId.value, payload);

    if (updated) {
      router.push({
        path: '/contract',
        state: {
          toastStatus: 'success',
          toastMessage: `Le contrat #${updated.number} a été modifié avec succès.`,
        },
      });
    }
}


</script>
  