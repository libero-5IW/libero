<template>
  <TemplateSelectionModal
    v-model="showTemplateModal"
    :fetchTemplates="fetchContractTemplates"
    :isForced="true"
    type="contrat"
    @templateSelected="handleTemplateSelected"
  />

  <div
    v-if="selectedTemplateId"
    class="focus:outline-none"
    role="main"
    aria-labelledby="contract-form-title"
    tabindex="-1"
    ref="mainContent"
  >
    <v-container fluid>
      <v-row dense>
        <v-col cols="12" md="8">
          <h1 id="contract-form-title" class="sr-only">Création d’un contrat</h1>
          <v-card flat class="mb-4 pa-4">
            <v-text-field
              :model-value="currentTemplate?.name ?? 'Template inconnu'"
              label="Template utilisé"
              readonly
              class="mb-6 pointer-events-none opacity-80"
              aria-label="Template utilisé"
            />
  
            <v-text-field
              v-if="contractNumberVariable"
              :model-value="contractNumberVariable.value"
              :label="contractNumberVariable.label || 'Numéro du contrat'"
              readonly
              class="mb-4 pointer-events-none opacity-80"
              aria-label="Numéro du contrat"
            />
          </v-card>

          <v-card flat class="mb-4 pa-4">
            <TemplateVariableSection
              title="Informations du Freelance"
              :variables="freelancerVariables"
              :variablesValue="variablesValue"
              section-label="Section informations du freelance"
            />

            <TemplateVariableSection
              title="Informations du Client"
              :variables="clientVariables"
              :variablesValue="variablesValue"
              :clients="clients"
              v-model:selectedClientId="selectedClientId"
              section-label="Section informations du client"
            />

            <TemplateVariableSection
              title="Autres Informations"
              :variables="otherVariables"
              :variablesValue="variablesValue"
              section-label="Section autres informations"
            />

            <v-btn
              v-if="!isEditMode"
              color="primary"
              @click="onCreateContract"
              :disabled="!canCreate || isLoading"
              aria-label="Créer le contrat"
              role="button"
            >
              <template v-if="!isLoading">
                <v-icon start>mdi-content-save</v-icon>
                Créer le contrat
              </template>
              <v-progress-circular
                v-else
                indeterminate
                size="20"
                color="secondary"
                aria-label="Chargement de la création du contrat"
              />
            </v-btn>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <InvoiceTemplatePreview
            :contentHtml="previewHtml"
            :variables="previewVariables"
            fileName="contrat"
            aria-label="Prévisualisation du contrat PDF"
            role="region"
          />
        </v-col>
      </v-row>

      <v-btn
        v-if="isEditMode"
        color="primary"
        @click="saveContract"
        :disabled="isLoading"
        aria-label="Enregistrer le contrat"
        role="button"
      >
        <template v-if="!isLoading">
          <v-icon start>mdi-content-save</v-icon>
          Enregistrer
        </template>
        <v-progress-circular
          v-else
          indeterminate
          size="20"
          color="white"
          aria-label="Enregistrement en cours du contrat"
        />
      </v-btn>
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
import { extractUsedVariableNames } from '@/utils/extractUsedVariables';
import type { VariableType, VariableValue } from '@/types';
import type { ContractTemplateVariable } from '@/schemas/contractTemplate.schema';
import type { CreateContract } from '@/schemas/contract.schema';
import { generateFinalHtml } from '@/utils/generateFinalHtml';

const route = useRoute();
const router = useRouter();

const contractStore = useContractStore();
const contractTemplateStore = useContractTemplateStore();
const clientStore = useClientStore();
const userStore = useUserStore();
const { showToast } = useToastHandler();

const showTemplateModal = ref(false);
const selectedTemplateId = ref<string | null>(null);
const selectedClientId = defineModel<string | null>('selectedClientId');
const previewHtml = ref('');
const templateVariables = ref<ContractTemplateVariable[]>([]);
const variablesValue = ref<VariableValue[]>([]);

const form = ref<CreateContract>({
  templateId: '',
  generatedHtml: '',
  validUntil: '',
  clientId: '',
  variableValues: [],
  issuedAt: undefined,
});

const contractId = computed(() => route.params.id as string | undefined);
const isEditMode = computed(() => !!contractId.value);

const currentUser = computed(() => userStore.user);
const currentTemplate = computed(() => contractTemplateStore.currentTemplate);
const clients = computed(() => clientStore.clients);
const isLoading = computed(() => contractStore.isLoading)

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

const contractNumberVariable = computed(() =>
  variablesValue.value.find(v => v.variableName === 'contract_number')
);

const previewVariables = computed(() => {
  const result: Record<string, string> = {};
  variablesValue.value.forEach(v => {
    result[v.variableName] = v.value || `<em class="text-gray-500">${v.label}</em>`;
  });
  return result;
});

onMounted(async () => {
  await initialize();

  if (isEditMode.value && contractId.value) {
    await contractStore.fetchContract(contractId.value);
    const contract = contractStore.currentContract;

    if (contract) {
      Object.assign(form.value, {
        templateId: contract.templateId ?? '',
        generatedHtml: contract.generatedHtml,
        validUntil: contract.validUntil,
        clientId: contract.clientId,
        issuedAt: contract.issuedAt,
        variableValues: contract.variableValues,
      });

      selectedClientId.value = contract.clientId ?? null;
      selectedTemplateId.value = contract.templateId ?? null;

      await contractTemplateStore.fetchTemplate(contract.templateId!);
      await handleTemplateSelected(contract.templateId!);

      variablesValue.value = contract.variableValues;
    }
  }
});

async function initialize() {
  const state = window.history.state;
  const templateIdFromState = state?.templateId as string | undefined;
  const templateIdFromQuery = route.query.templateId as string | undefined;
  const templateId = templateIdFromState || templateIdFromQuery;

  await clientStore.fetchAllClients();

  if (state?.fromQuoteId && templateIdFromState) {
    form.value.templateId = templateIdFromState;
    form.value.clientId = state.clientId;
    form.value.quoteId = state.fromQuoteId; 
    form.value.variableValues = state.variables;
    variablesValue.value = state.variables;
    selectedTemplateId.value = templateIdFromState;
  }

  if (!templateId && !isEditMode.value) {
    showTemplateModal.value = true;
    return;
  }

  if (templateId) {
    await contractTemplateStore.fetchTemplate(templateId);
    if (!contractTemplateStore.currentTemplate) {
      showTemplateModal.value = true;
      return;
    }

    selectedTemplateId.value = templateId;
    handleTemplateSelected(templateId);
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

  const usedVariableNames = extractUsedVariableNames(template.contentHtml);
  const filtered = template.variables.filter(
    (v, i, arr) =>
      usedVariableNames.includes(v.variableName) &&
      arr.findIndex(x => x.variableName === v.variableName) === i
  );

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
    variables.map(v => ({ ...v, type: v.type as VariableType }))
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
  console.log('variables.some(v => v.variableName === )', variables.some(v => v.variableName === 'contract_number'));
  console.log('variables', variables);
  
  if (variables.some(v => v.variableName === 'contract_number')) {
    const nextNumber = await contractStore.fetchNextContractNumber();
    console.log('nextNumber', nextNumber);
    
    if (nextNumber) updateVariable('contract_number', `${nextNumber}`);
  }

  updateVariable('freelancer_name', `${user.firstName} ${user.lastName}`);
  updateVariable('freelancer_address', `${user.addressLine}, ${user.postalCode} ${user.city}, ${user.country}`);
  updateVariable('freelancer_siret', user.siret ?? '');

  const today = new Date().toISOString().split('T')[0];
  const validUntil = new Date(Date.now() + THIRTY_DAYS_IN_MS).toISOString().split('T')[0];

  updateVariable('issue_date', today);
  updateVariable('valid_until', validUntil);
}

function updateVariable(name: string, newValue: string) {
  const v = variablesValue.value.find(v => v.variableName === name);
  if (v) {
    v.value = newValue;
  }
}

const canCreate = computed(() => {
  const hasTemplate = !!selectedTemplateId.value;
  const hasUser = !!currentUser.value;
  const allRequiredFilled = templateVariables.value.every(v =>
      [
        'freelancer_signature',
        'freelancer_fullname_signed', 
        'freelancer_date_signed', 
        'client_signature', 
        'client_date_signed', 
        'client_fullname_signed'
      ].includes(v.variableName)
        ? true
        : !v.required || !!variablesValue.value.find(val => val.variableName === v.variableName)?.value
    );

  return hasTemplate && hasUser && allRequiredFilled;
});

const orderedTemplateVariables = computed(() => {
  return [...templateVariables.value].sort((a, b) => {
    const indexA = previewHtml.value.indexOf(`{{${a.variableName}}}`);
    const indexB = previewHtml.value.indexOf(`{{${b.variableName}}}`);
    return indexA - indexB;
  });
});

const freelancerVariables = computed(() =>
  orderedTemplateVariables.value.filter(
    v =>
      v.variableName.startsWith('freelancer_') &&
      ![
        'freelancer_signature',
        'freelancer_fullname_signed', 
        'freelancer_date_signed', 
      ].includes(v.variableName)
  )
);

const clientVariables = computed(() =>
  orderedTemplateVariables.value.filter(
    v =>
      v.variableName.startsWith('client_') &&
      ![
        'client_signature',
        'client_date_signed', 
        'client_fullname_signed'
      ].includes(v.variableName)
  )
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
      ![        
        'freelancer_signature',
        'freelancer_fullname_signed', 
        'freelancer_date_signed', 
        'client_signature', 
        'client_date_signed', 
        'client_fullname_signed'
      ].includes(v.variableName) &&
      !variablesValue.value.find(val => val.variableName === v.variableName)?.value
  );

  if (missingFields.length > 0) {
    showToast('error', `Veuillez remplir tous les champs obligatoires : ${missingFields.map(f => f.label).join(', ')}`);
    return;
  }

  const payload: CreateContract = {
    templateId: selectedTemplateId.value!,
    ...(selectedClientId.value ? { clientId: selectedClientId.value } : {clientId: null}),
    ...(history.state?.fromQuoteId ? { quoteId: history.state.fromQuoteId } : {}),
    issuedAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + THIRTY_DAYS_IN_MS).toISOString(),
    generatedHtml: generateFinalHtml(previewHtml.value, variablesValue.value),
    variableValues: variablesValue.value.map(v => ({
      variableName: v.variableName,
      value: v.value,
    }))
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

async function saveContract() {
  if (isEditMode.value && contractId.value) {
    const payload = {
      templateId: selectedTemplateId.value!,
      ...(selectedClientId.value ? { clientId: selectedClientId.value } : {clientId: null}),
      issuedAt: form.value.issuedAt ?? new Date().toISOString(),
      validUntil: form.value.validUntil,
      generatedHtml: generateFinalHtml(previewHtml.value, variablesValue.value),
      variableValues: variablesValue.value.map(v => ({
        id: v.id!,
        variableName: v.variableName,
        value: v.value,
        label: v.label,
        type: v.type,
        required: v.required,
        contractId: contractId.value!,
      }))
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
}
</script>
