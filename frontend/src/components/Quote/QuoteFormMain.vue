<template>
  <v-card flat class="mb-4">
    <EditableHeader :title="'Créer un devis'" back-route-name="QuoteList" />
  </v-card>

  <v-card flat class="mb-4 pa-4">
      <v-select
        v-model="selectedClientId"
        :items="clients"
        item-text="name"
        item-value="id"
        label="Sélectionner un client"
      />
    </v-card>

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
  </v-card>

  <v-card flat class="text-right mt-4">
    <v-btn color="primary" @click="onCreateQuote">
      <v-icon start>mdi-content-save</v-icon>
      Créer le devis
    </v-btn>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue';
import EditableHeader from '@/components/TemplateEditor/EditableHeader.vue';
import { useQuoteStore } from '@/stores/quote';
import type { QuoteTemplateVariable } from '@/schemas/quoteTemplate.schema';
import { useClientStore } from '@/stores/client';  
import { useUserStore } from '@/stores/user';
import TemplateVariableSection from '@/components/DocumentForm/TemplateVariableSection.vue';
import type { VariableValue } from '@/types';
import type { CreateQuote } from '@/schemas/quote.schema';


const props = defineProps<{
  templateVariables: QuoteTemplateVariable[];
  templateId: string;
}>();

const variablesValue = ref<VariableValue[]>([]);

const emit = defineEmits(['quoteCreated']);
const selectedClientId = ref<string>('');
const variables = ref<Record<string, string>>({});

const quoteStore = useQuoteStore();
const clientStore = useClientStore();

const userStore = useUserStore();
const currentUser = computed(() => userStore.user);

const clients = computed(() => clientStore.clients);

async function onCreateQuote() {

  const payload: CreateQuote = {
  templateId: props.templateId,
  clientId: selectedClientId.value,
  issuedAt: new Date().toISOString(),
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  generatedHtml: '', 
  variableValues: variablesValue.value.map(v => ({
    variableName: v.variableName,
    value: v.value,
  })),
  };

  const quote = await quoteStore.createQuote(payload);
  emit('quoteCreated', quote);
}

watchEffect(() => {
  variablesValue.value = props.templateVariables.map(v => ({
    variableName: v.variableName,
    label: v.label,
    type: v.type,
    required: v.required,
    value: variables.value[v.variableName] || '',
    id: v.id,
    templateId: v.templateId,
  }));
});

const freelancerVariables = computed(() =>
  props.templateVariables.filter(v => v.variableName.startsWith('freelancer_'))
);

const clientVariables = computed(() =>
  props.templateVariables.filter(v => v.variableName.startsWith('client_'))
);

const otherVariables = computed(() =>
  props.templateVariables.filter(v =>
    !v.variableName.startsWith('freelancer_') &&
    !v.variableName.startsWith('client_') &&
    v.variableName !== 'quote_number'
  )
);

onMounted(async () => {
  await clientStore.fetchAllClients();
});

</script>
