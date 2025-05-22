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

          <v-select
              v-model="selectedTemplateId"
              :items="templateOptions"
              item-title="name"
              item-value="id"
              label="Template sélectionné"
              class="mb-6"
              disabled
              @update:modelValue="handleTemplateSelected"
          />

          <v-card flat class="mb-4 pa-4">
            <h3 class="mb-2">Informations du Freelance</h3>
            <div 
              v-for="variable in orderedTemplateVariables.filter(v => 
                v.variableName.startsWith('freelancer_')
              )" 
              :key="variable.variableName" 
              class="mb-3"
            >
              <v-text-field
                v-model="variablesValue[variable.variableName]"
                :label="variable.label"
                :type="mapType(variable.type)"
                :required="variable.required"
              />
            </div>

            <h3 class="mt-6 mb-2">Informations du Client</h3>
            <v-select
              v-model="selectedClientId"
              :items="clients"
              item-title="fullName"
              item-value="id"
              label="Sélectionner un client"
              class="mb-4"
            />

            <div 
              v-for="variable in orderedTemplateVariables.filter(v => 
                v.variableName.startsWith('client_')
              )" 
              :key="variable.variableName" 
              class="mb-3"
            >
              <v-text-field
                v-model="variablesValue[variable.variableName]"
                :label="variable.label"
                :type="mapType(variable.type)"
                :required="variable.required"
              />
            </div>

            <h3 class="mt-6 mb-2">Autres Informations</h3>
            <div 
              v-for="variable in orderedTemplateVariables.filter(v => 
                !v.variableName.startsWith('freelancer_') &&
                !v.variableName.startsWith('client_') &&
                v.variableName !== 'quote_number'
              )" 
              :key="variable.variableName" 
              class="mb-3"
            >
              <component
                :is="getInputComponent(variable.type)"
                v-model="variablesValue[variable.variableName]"
                :label="variable.label"
                :type="mapType(variable.type)"
                :required="variable.required"
              />
            </div>

            <v-btn color="primary" @click="onCreateQuote" :disabled="!canCreate">
              <v-icon start>mdi-content-save</v-icon>
              Créer la facture
            </v-btn>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <QuoteTemplatePreview
            :contentHtml="previewHtml"
            :variables="previewVariables"
            fileName="facture"
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
  import type { QuoteTemplate, QuoteTemplateVariable } from '@/schemas/quoteTemplate.schema';
  import { useToastHandler } from '@/composables/useToastHandler';
  import { mapTemplateVariables } from '@/utils/mapTemplateVariables';
import type { VariableType } from '@/types';
  
  const router = useRouter();
  const route = useRoute();
  
  const quoteTemplateStore = useQuoteTemplateStore();
  const quoteStore = useQuoteStore();
  const clientStore = useClientStore();
  const userStore = useUserStore();
  
  const showTemplateModal = ref(false);
  const selectedTemplateId = ref<string | null>(null);
  const templateVariables = ref<QuoteTemplateVariable[]>([]);
  const variablesValue = ref<Record<string, string>>({});
  const previewHtml = ref<string>('');
  const previewVariables = ref<Record<string, string>>({});
  const selectedClientId = ref<string>('');
  const { showToast } = useToastHandler();
  
  const currentUser = computed(() => userStore.user);
  const defaultTemplate = computed(() => quoteTemplateStore.defaultTemplate);
  
  const clients = computed(() =>
    clientStore.clients.map(client => ({
      id: client.id,
      fullName: `${client.firstName} ${client.lastName}`,
    }))
  );
  
  onMounted(initialize)
  
  async function initialize() {
    try {
      const templateIdFromQuery = route.query.templateId as string | undefined;
      const templateId = selectedTemplateId.value || templateIdFromQuery;
      
      await clientStore.fetchAllClients()

      if(!templateId) {
        showTemplateModal.value = true;
        return;
      }

      await quoteTemplateStore.fetchTemplate(templateId)
      
      if (templateId != 'defaultTemplate' && !quoteTemplateStore.currentTemplate) {
        showTemplateModal.value = true;
      } else {
        selectedTemplateId.value = templateId;
      }

      handleTemplateSelected(templateId);

    } catch (error) {
      showTemplateModal.value = true;
    }

  };

  async function fetchQuoteTemplates() {
    await quoteTemplateStore.fetchAllTemplates();

    const quoteTemplateList: { id: string; name: string }[] = 
      quoteTemplateStore.templates
      .map(template => ({
        id: template.id as string,
        name: template.name
      }));

    return quoteTemplateList;
  }

  async function handleTemplateSelected(templateId: string) {
    selectedTemplateId.value = templateId;
  
    const template =
      defaultTemplate.value?.id === templateId
        ? defaultTemplate.value
        : await loadAndGetTemplate(templateId)
  
    if (!template) return;
  
    templateVariables.value = mapTemplateVariablesWithEnum(template.variables);
    previewHtml.value = template.contentHtml;

    resetVariableValues(template.variables);
    fillSystemValues(template.variables);
    fillPreview();
  }

  async function loadAndGetTemplate(templateId: string) {
    await quoteTemplateStore.fetchTemplate(templateId)
    return quoteTemplateStore.currentTemplate
  }

  function mapTemplateVariablesWithEnum(variables: QuoteTemplateVariable[]) {
    return mapTemplateVariables(
      variables.map((v) => ({ ...v, type: v.type as VariableType }))
    )
  }

  function resetVariableValues(variables: QuoteTemplateVariable[]) {
    previewVariables.value = {}
    variablesValue.value = {}

    variables.forEach((v) => {
      previewVariables.value[v.variableName] = `<em class="text-gray-500">${v.label}</em>`
      variablesValue.value[v.variableName] = ''
    })
  }

  async function fillSystemValues(variables: QuoteTemplateVariable[]) {
      if (!currentUser.value?.id) {
        await userStore.fetchCurrentUser();
      }
      const userId = currentUser.value?.id;

    if (!userId) return

    if (variables.some((v) => v.variableName === 'quote_number')) {
      const nextNumber = await quoteStore.fetchNextQuoteNumber()
      if (nextNumber) variablesValue.value['quote_number'] = `${nextNumber}`
    }

    if ('freelancer_name' in variablesValue.value) {
      variablesValue.value['freelancer_name'] = `${currentUser.value.firstName} ${currentUser.value.lastName}`
    }

    if ('freelancer_address' in variablesValue.value) {
      variablesValue.value['freelancer_address'] = `${currentUser.value.addressLine}, 
        ${currentUser.value.postalCode} ${currentUser.value.city}, ${currentUser.value.country}`
    }
    
    if ('freelancer_siret' in variablesValue.value) {
      variablesValue.value['freelancer_siret'] = currentUser.value.siret
    }
  }

  function fillPreview() {
    templateVariables.value.forEach((v) => {
      previewVariables.value[v.variableName] =
        variablesValue.value[v.variableName] || `<em class="text-gray-500">${v.label}</em>`
    })
  }
  
  const templateOptions = computed(() => {
    const options = quoteTemplateStore.templates.map(t => ({
      id: t.id,
      name: t.name,
    }));
  
    if (defaultTemplate.value) {
      options.unshift({
        id: defaultTemplate.value.id,
        name: defaultTemplate.value.name,
      });
    }
  
    return options;
  });
  
  const canCreate = computed(() => {
    const hasTemplate = !!selectedTemplateId.value;
    const hasClient = !!selectedClientId.value;
    const hasUser = !!currentUser.value;
  
    const allRequiredFilled = templateVariables.value.every(v =>
      !v.required || !!variablesValue.value[v.variableName]
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
  
  function mapType(type: string) {
    if (type === 'number') return 'number';
    if (type === 'date') return 'date';
    if (type === 'email') return 'email';
    if (type === 'url') return 'url';
    return 'text';
  }

  function getInputComponent(type: VariableType) {
    switch (type) {
      case 'textarea':
        return 'v-textarea';
      default:
        return 'v-text-field';
    }
  }
  
  async function onCreateQuote() {
    if (!currentUser.value) {
      alert("Utilisateur non chargé !");
      return;
    }
  
    const missingFields = templateVariables.value.filter(
      v => v.required && !variablesValue.value[v.variableName]
    );
    if (missingFields.length > 0) {
      alert(`Veuillez remplir tous les champs obligatoires : ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    if(!selectedTemplateId.value) {
      showToast('error', 'Vous n\'avez pas sélectionné de template de devis');
      return;
    }
    
    const payload = {
      templateId: selectedTemplateId.value,
      clientId: selectedClientId.value,
      validUntil: new Date().toISOString(),
      variableValues: Object.entries(variablesValue.value).map(([variableName, value]) => ({
        variableName,
        value,
      })),
      generatedHtml: generateHtmlFromTemplate(previewHtml.value, variablesValue.value),
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
  
  function generateHtmlFromTemplate(templateHtml: string, vars: Record<string, string>): string {
    let html = templateHtml;
    for (const [key, value] of Object.entries(vars)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value);
    }
    return html;
  }
  
  watch(variablesValue, (newVars) => {
    const updatedPreview: Record<string, string> = {};
    templateVariables.value.forEach(v => {
      updatedPreview[v.variableName] = newVars[v.variableName] || `<em class="text-gray-500">${v.label}</em>`;
    });
    previewVariables.value = updatedPreview;
  }, { deep: true });
  
  watch(selectedClientId, (newClientId) => {
    if (!newClientId) return;
    const client = clientStore.clients.find(c => c.id === newClientId);
    if (client) {
      if ('client_name' in variablesValue.value) {
        variablesValue.value['client_name'] = `${client.firstName} ${client.lastName}`;
      }
      if ('client_address' in variablesValue.value) {
        variablesValue.value['client_address'] = `${client.addressLine}, ${client.postalCode} ${client.city}, ${client.country}`;
      }
    }
  });
</script>
  
