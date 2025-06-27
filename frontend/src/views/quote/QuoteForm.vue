<template>
  <TemplateSelectionModal
      v-model="showTemplateModal" 
      :fetchTemplates="fetchQuoteTemplates"
      :isForced="true"
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
            v-if="quoteNumberVariable"
            :model-value="quoteNumberVariable.value"
            :label="quoteNumberVariable.label || 'Numéro du devis'"
            readonly
            class="mb-4 pointer-events-none opacity-60"
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

            <v-btn color="primary" @click="onCreateQuote" :disabled="!canCreate">
              <v-icon start>mdi-content-save</v-icon>
              Créer le devis
            </v-btn>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <QuoteTemplatePreview
            :contentHtml="previewHtml"
            :variables="previewVariables"
            fileName="devis"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useQuoteTemplateStore } from '@/stores/quoteTemplate';
  import { useQuoteStore } from '@/stores/quote';
  import { useClientStore } from '@/stores/client';
  import { useUserStore } from '@/stores/user';
  import QuoteTemplatePreview from '@/components/ui/PreviewPdf.vue';
  import TemplateSelectionModal from '@/components/Modals/TemplateSelectionModal.vue';
  import TemplateVariableSection from '@/components/DocumentForm/TemplateVariableSection.vue';
  import type { QuoteTemplateVariable } from '@/schemas/quoteTemplate.schema';
  import { useToastHandler } from '@/composables/useToastHandler';
  import { mapTemplateVariables } from '@/utils/mapTemplateVariables';
  import type { VariableValue, VariableType } from '@/types';
  import { QUOTE_STATUS } from '@/constants/status/quote-status.constant';
  import { extractUsedVariableNames } from '@/utils/extractUsedVariables';

  const router = useRouter();
  const route = useRoute();

  const quoteTemplateStore = useQuoteTemplateStore();
  const quoteStore = useQuoteStore();
  const clientStore = useClientStore();
  const userStore = useUserStore();

  const showTemplateModal = ref(false);
  const selectedTemplateId = ref<string | null>(null);
  const templateVariables = ref<QuoteTemplateVariable[]>([]);
  const variablesValue = ref<VariableValue[]>([]);
  const previewHtml = ref<string>('');
  const selectedClientId = defineModel<string>('selectedClientId');
  const { showToast } = useToastHandler();
  const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

  const currentUser = computed(() => userStore.user);
  const currentTemplate = computed(() => quoteTemplateStore.currentTemplate);
  const clients = computed(() => clientStore.clients);

  onMounted(initialize);

  async function initialize() {
    try {
      const templateIdFromQuery = route.query.templateId as string | undefined;
      const templateId = selectedTemplateId.value || templateIdFromQuery;

      await clientStore.fetchAllClients();
      
      if (!templateId) {
        showTemplateModal.value = true;
        return;
      }

      await quoteTemplateStore.fetchTemplate(templateId);

      if (!quoteTemplateStore.currentTemplate) {
        showTemplateModal.value = true;
      } else {
        selectedTemplateId.value = templateId;
      }

      handleTemplateSelected(templateId);
    } catch (error) {
      showTemplateModal.value = true;
    }
  }

  async function fetchQuoteTemplates() {
    await quoteTemplateStore.fetchAllTemplates();
    return quoteTemplateStore.templates.map(template => ({
      id: template.id as string,
      name: template.name
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
    await quoteTemplateStore.fetchTemplate(templateId);
    return quoteTemplateStore.currentTemplate;
  }

  function mapTemplateVariablesWithEnum(variables: QuoteTemplateVariable[]) {
    return mapTemplateVariables(
      variables.map((v) => ({ ...v, type: v.type as VariableType }))
    );
  }

  function resetVariableValues(variables: QuoteTemplateVariable[]) {
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
  
  async function fillSystemValues(variables: QuoteTemplateVariable[]) {

    const today = new Date().toISOString().split('T')[0];
    const validUntil = new Date(Date.now() + THIRTY_DAYS_IN_MS).toISOString().split('T')[0];

    updateVariable('issue_date', today);
    updateVariable('valid_until', validUntil);

    updateVariable('payment_terms', 'Paiement sous 30 jours');
    updateVariable('late_penalty', 'Pénalités de 10% après échéance');
    updateVariable('tva_detail', 'TVA de 20% incluse');

    if (!currentUser.value?.id) {
      await userStore.fetchCurrentUser();
    }
    
    if (variables.some((v) => v.variableName === 'quote_number')) {
      const nextNumber = await quoteStore.fetchNextQuoteNumber();
      if (nextNumber) updateVariable('quote_number', `${nextNumber}`);
    }
    
    updateVariable('freelancer_name', `${currentUser.value?.firstName} ${currentUser.value?.lastName}`);
    updateVariable('freelancer_address', `${currentUser.value?.addressLine}, ${currentUser.value?.postalCode} ${currentUser.value?.city}, ${currentUser.value?.country}`);
    updateVariable('freelancer_siret', currentUser.value?.siret?? '');
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

  const previewVariables = computed(() => {
    const result: Record<string, string> = {};
    variablesValue.value.forEach(v => {
      result[v.variableName] = v.value || `<em class="text-gray-500">${v.label}</em>`;
    });
    return result;
  });

  const orderedTemplateVariables = computed(() => {
    return [...templateVariables.value].sort((a, b) => {
      const indexA = previewHtml.value.indexOf(`{{${a.variableName}}}`);
      const indexB = previewHtml.value.indexOf(`{{${b.variableName}}}`);
      return indexA - indexB;
    });
  });

  const quoteNumberVariable = computed(() =>
  variablesValue.value.find((v) => v.variableName === 'quote_number')
  );

  const freelancerVariables = computed(() =>
    orderedTemplateVariables.value.filter((v) =>
      v.variableName.startsWith('freelancer_')
    )
  );

  const clientVariables = computed(() =>
    orderedTemplateVariables.value.filter((v) =>
      v.variableName.startsWith('client_')
    )
  );

  const otherVariables = computed(() =>
    orderedTemplateVariables.value.filter(
      (v) =>
        !v.variableName.startsWith('freelancer_') &&
        !v.variableName.startsWith('client_')
    )
  );

  async function onCreateQuote() {
    if (!currentUser.value) {
      showToast('error',`Utilisateur non chargé !` );
      return;
    }

    const missingFields = templateVariables.value.filter(
      v => v.required && !variablesValue.value.find(val => val.variableName === v.variableName)?.value
    );
    if (missingFields.length > 0) {
      showToast('error',`Veuillez remplir tous les champs obligatoires : ${missingFields.map(f => f.label).join(', ')}` );
      return;
    }

    if (!selectedTemplateId.value) {
      showToast('error', 'Vous n\'avez pas sélectionné de template de devis');
      return;
    }

    const payload = {
      templateId: selectedTemplateId.value,
      clientId: selectedClientId.value!,
      status: QUOTE_STATUS.DRAFT,
      issuedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + THIRTY_DAYS_IN_MS).toISOString(),
      variableValues: variablesValue.value.map(v => ({
        variableName: v.variableName,
        value: v.value,
      })),
      generatedHtml: previewHtml.value,
      variables: Object.fromEntries(
        variablesValue.value.map(v => [v.variableName, v.value])
      ),
    };

    const quote = await quoteStore.createQuote(payload);

    if (quote) {
      router.push({
        path: '/quote',
        state: {
          toastStatus: 'success',
          toastMessage: `Le devis #${quote.number} a été créé avec succès.`,
        },
      });
    }
  }

  watch(selectedClientId, (newClientId) => {
    if (!newClientId) return;
    const client = clientStore.clients.find(c => c.id === newClientId);
    if (client) {
      updateVariable('client_name', `${client.firstName} ${client.lastName}`);
      updateVariable('client_address', `${client.addressLine}, ${client.postalCode} ${client.city}, ${client.country}`);
    }
  });
</script>
