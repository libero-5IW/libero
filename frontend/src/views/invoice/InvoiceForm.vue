<template>
  <TemplateSelectionModal
    v-model="showTemplateModal"
    :fetchTemplates="fetchInvoiceTemplates"
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
            v-if="invoiceNumberVariable"
            :model-value="invoiceNumberVariable.value"
            :label="invoiceNumberVariable.label || 'Numéro de la facture'"
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
              @click="onCreateInvoice"
              :disabled="!canCreate"
            >
              <v-icon start>mdi-content-save</v-icon>
              Créer la facture
            </v-btn>

          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <InvoiceTemplatePreview
            :contentHtml="previewHtml"
            :variables="previewVariables"
            fileName="facture"
          />
        </v-col>
      </v-row>
    </v-container>
    <v-btn
      v-if="isEditMode"
      color="primary"
      @click="saveInvoice"
    >
      Enregistrer
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInvoiceTemplateStore } from '@/stores/invoiceTemplate';
import { useInvoiceStore } from '@/stores/invoice';
import { useClientStore } from '@/stores/client';
import { useUserStore } from '@/stores/user';
import TemplateSelectionModal from '@/components/Modals/TemplateSelectionModal.vue';
import TemplateVariableSection from '@/components/DocumentForm/TemplateVariableSection.vue';
import InvoiceTemplatePreview from '@/components/ui/PreviewPdf.vue';
import { useToastHandler } from '@/composables/useToastHandler';
import { mapTemplateVariables } from '@/utils/mapTemplateVariables';
import type { VariableValue, VariableType } from '@/types';
import type { InvoiceTemplateVariable } from '@/schemas/invoiceTemplate.schema';
import { INVOICE_STATUS } from '@/constants/status/invoice-status.constant';
import { extractUsedVariableNames } from '@/utils/extractUsedVariables'
import type { CreateInvoice } from '@/schemas/invoice.schema';

const route = useRoute();
const router = useRouter();

const invoiceTemplateStore = useInvoiceTemplateStore();
const invoiceStore = useInvoiceStore();
const clientStore = useClientStore();
const userStore = useUserStore();
const { showToast } = useToastHandler();

const showTemplateModal = ref(false);
const selectedTemplateId = ref<string | null>(null);
const selectedClientId = defineModel<string | null>('selectedClientId');
const previewHtml = ref('');
const templateVariables = ref<InvoiceTemplateVariable[]>([]);
const variablesValue = ref<VariableValue[]>([]);

const form = ref<CreateInvoice>({
  templateId: '',
  generatedHtml: '',
  dueDate: '',
  clientId: '',
  variableValues: [],
  issuedAt: undefined
});

const invoiceId = computed(() => route.params.id as string | undefined);
const isEditMode = computed(() => !!invoiceId.value);


const currentUser = computed(() => userStore.user);
const currentTemplate = computed(() => invoiceTemplateStore.currentTemplate);
const clients = computed(() => clientStore.clients);
const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;
const invoiceNumberVariable = computed(() =>
  variablesValue.value.find((v) => v.variableName === 'invoice_number')
);
const previewVariables = computed(() => {
  const result: Record<string, string> = {};
  variablesValue.value.forEach(v => {
    result[v.variableName] = v.value || `<em class="text-gray-500">${v.label}</em>`;
  });
  return result;
});

onMounted(initialize);

onMounted(async () => {
  if (isEditMode.value && invoiceId.value) {
    await invoiceStore.fetchInvoice(invoiceId.value);
    const invoice = invoiceStore.currentInvoice;

    if (invoice) {
      Object.assign(form.value, {
      templateId: invoice.templateId ?? '',
      generatedHtml: invoice.generatedHtml,
      dueDate: invoice.dueDate,
      clientId: invoice.clientId,
      issuedAt: invoice.issuedAt,
      variableValues: invoice.variableValues.map(v => ({
        id: v.id,
        variableName: v.variableName,
        value: v.value,
        label: v.label,
        type: v.type,
        required: v.required,
        invoiceId: invoice.id,
      })),
    });

    selectedClientId.value = invoice.clientId ?? null; 

    if (invoice.templateId) {
      selectedTemplateId.value = invoice.templateId;
      await invoiceTemplateStore.fetchTemplate(invoice.templateId);
      await handleTemplateSelected(invoice.templateId);

      variablesValue.value = invoice.variableValues.map(v => ({
        id: v.id,
        variableName: v.variableName,
        value: v.value,
        label: v.label,
        type: v.type,
        required: v.required,
        invoiceId: invoice.id,
      }));

    }
}}});


async function initialize() {
  const templateIdFromQuery = route.query.templateId as string | undefined;
  const templateId = selectedTemplateId.value || templateIdFromQuery;

  await clientStore.fetchAllClients();

  if (!templateId && !isEditMode.value) {
  showTemplateModal.value = true;
  return;
  }

if (templateId) {
  await invoiceTemplateStore.fetchTemplate(templateId);

  if (!invoiceTemplateStore.currentTemplate) {
    showTemplateModal.value = true;
    return;
  }

  selectedTemplateId.value = templateId;
  handleTemplateSelected(templateId);
} else if (!isEditMode.value) {
  showTemplateModal.value = true;
}
}

async function fetchInvoiceTemplates() {
  await invoiceTemplateStore.fetchAllTemplates();
  return invoiceTemplateStore.templates.map(t => ({
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
  await invoiceTemplateStore.fetchTemplate(templateId);
  return invoiceTemplateStore.currentTemplate;
}

function mapTemplateVariablesWithEnum(variables: InvoiceTemplateVariable[]) {
  return mapTemplateVariables(
    variables.map((v) => ({ ...v, type: v.type as VariableType }))
  );
}

function resetVariableValues(variables: InvoiceTemplateVariable[]) {
  const valueMap = new Map<string, string>(
    variablesValue.value.map(v => [v.variableName, v.value])
  );

  variablesValue.value = variables
  .map(v => ({
    variableName: v.variableName,
    label: v.label,
    type: v.type as VariableType,
    required: v.required,
    value: valueMap.get(v.variableName) ?? '',
    id: v.id,
    templateId: v.templateId,
  }));
}

async function fillSystemValues(variables: InvoiceTemplateVariable[]) {
  if (!currentUser.value?.id) {
    await userStore.fetchCurrentUser();
  }

  const user = currentUser.value;
  if (!user) return;

  if (variables.some(v => v.variableName === 'invoice_number')) {
    const nextNumber = await invoiceStore.fetchNextInvoiceNumber();
    if (nextNumber) updateVariable('invoice_number', `${nextNumber}`);
  }

  updateVariable('freelancer_name', `${user.firstName} ${user.lastName}`);
  updateVariable('freelancer_address', `${user.addressLine}, ${user.postalCode} ${user.city}, ${user.country}`);
  updateVariable('freelancer_siret', user.siret ?? '');

  const today = new Date().toISOString().split('T')[0];
  const due = new Date(Date.now() + THIRTY_DAYS_IN_MS).toISOString().split('T')[0];

  updateVariable('issue_date', today);
  updateVariable('due_date', due);

  updateVariable('payment_terms', 'Paiement sous 30 jours');
  updateVariable('late_penalty', 'Pénalités de 10% après échéance');
  updateVariable('tva_detail', 'TVA de 20% incluse');
}

function updateVariable(name: string, newValue: string) {
  const v = variablesValue.value.find(v => v.variableName === name);
  if (v) {
    v.value = newValue;
  }
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
    !v.variableName.startsWith('client_')&&
    v.variableName !== 'invoice_number'
  )
);

const saveInvoice = async () => {

  if (isEditMode.value && invoiceId.value) {
    const payload = {
      templateId: selectedTemplateId.value!,
      clientId: selectedClientId.value!,
      issuedAt: form.value.issuedAt ?? new Date().toISOString(),
      dueDate: form.value.dueDate,
      generatedHtml: previewHtml.value,
      variableValues: variablesValue.value.map(v => ({
      id: v.id!,
      variableName: v.variableName,
      value: v.value,
      label: v.label,
      type: v.type,
      required: v.required,
      invoiceId: invoiceId.value!,
    }))
    };

    const updated = await invoiceStore.updateInvoice(invoiceId.value, payload);

    if (updated) {
      router.push({
        path: '/invoice',
        state: {
          toastStatus: 'success',
          toastMessage: `La facture #${updated.number} a été modifiée avec succès.`,
        },
      });
    }

    } else {
    const created = await invoiceStore.createInvoice({
      ...form.value,
      issuedAt: form.value.issuedAt ?? new Date().toISOString()
    });

    if (created) {
      showToast('success', `Facture créée avec succès.`);
      router.push({ name: 'InvoiceList' });
    }
  }
};

watch(selectedClientId, (newClientId) => {
  const client = clients.value.find(c => c.id === newClientId);
  if (!client) return;
  updateVariable('client_name', `${client.firstName} ${client.lastName}`);
  updateVariable('client_address', `${client.addressLine}, ${client.postalCode} ${client.city}, ${client.country}`);
});

async function onCreateInvoice() {
  const user = currentUser.value;
  if (!user) {
    showToast('error', 'Utilisateur non chargé !');
    return;
  }

  const missingFields = templateVariables.value.filter(v => v.required && !variablesValue.value.find(val => val.variableName === v.variableName)?.value);

  if (missingFields.length > 0) {
    showToast('error', `Veuillez remplir tous les champs obligatoires : ${missingFields.map(f => f.label).join(', ')}`);
    return;
  }

  if (!selectedTemplateId.value) {
    showToast('error', 'Vous n\'avez pas sélectionné de template de facture');
    return;
  }

  const payload: CreateInvoice = {
    templateId: selectedTemplateId.value!,
    clientId: selectedClientId.value!,
    issuedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + THIRTY_DAYS_IN_MS).toISOString(),
    generatedHtml: previewHtml.value,
    variableValues: variablesValue.value.map(v => ({
      id: v.id!,
      variableName: v.variableName,
      value: v.value,
      label: v.label,
      type: v.type,
      required: v.required,
      invoiceId: invoiceId.value!, 
    }))
  };

  const invoice = await invoiceStore.createInvoice(payload);

  if (invoice) {
    router.push({
      path: '/invoice',
      state: {
        toastStatus: 'success',
        toastMessage: `La facture #${invoice.number} a été créée avec succès.`,
      },
    });
  }
}

</script>
