<template>
    <v-container fluid>
      <v-row dense>
        <v-col cols="12" md="8">
          <v-card flat class="mb-4 pa-4">
            <v-select
              v-model="selectedTemplateId"
              :items="templates"
              item-title="name"
              item-value="id"
              label="Sélectionner un template"
              @update:modelValue="onTemplateChange"
            />
  
            <v-select
              v-model="selectedClientId"
              :items="clients"
              item-title="fullName"
              item-value="id"
              label="Sélectionner un client"
            />
  
            <div v-for="variable in orderedTemplateVariables" :key="variable.variableName" class="mb-3">
              <v-text-field
                v-model="variables[variable.variableName]"
                :label="variable.label"
                :type="mapType(variable.type)"
                :required="variable.required"
              />
            </div>
  
            <v-btn color="primary" @click="onCreateInvoice" :disabled="!canCreate">
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
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useInvoiceTemplateStore } from '@/stores/invoiceTemplate';
  import { useInvoiceStore } from '@/stores/invoice';
  import { useClientStore } from '@/stores/client';
  import QuoteTemplatePreview from '@/components/ui/PreviewPdf.vue';
  import type { InvoiceTemplateVariable } from '@/schemas/invoiceTemplate.schema';
  
  const router = useRouter();
  const invoiceTemplateStore = useInvoiceTemplateStore();
  const invoiceStore = useInvoiceStore();
  const clientStore = useClientStore();
  
  const selectedTemplateId = ref<string>('');
  const selectedClientId = ref<string>('');
  const templateVariables = ref<InvoiceTemplateVariable[]>([]);
  const variables = ref<Record<string, string>>({});
  
  const previewHtml = ref<string>('');
  const previewVariables = ref<Record<string, string>>({});
  
  onMounted(async () => {
    await invoiceTemplateStore.fetchAllTemplates();
    await clientStore.fetchAllClients();
  });
  
  const templates = computed(() => invoiceTemplateStore.templates);
  const clients = computed(() =>
    clientStore.clients.map(client => ({
      id: client.id,
      fullName: `${client.firstName} ${client.lastName}`,
    }))
  );
  
  const canCreate = computed(() => selectedTemplateId.value && selectedClientId.value);
  
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
    return 'text';
  }
  
  async function onTemplateChange() {
    if (!selectedTemplateId.value) return;
    await invoiceTemplateStore.fetchTemplate(selectedTemplateId.value);
    const template = invoiceTemplateStore.currentTemplate;
  
    if (template) {
      templateVariables.value = template.variables;
      previewHtml.value = template.contentHtml;
      previewVariables.value = {};
      variables.value = {};
  
      template.variables.forEach(v => {
        previewVariables.value[v.variableName] = `<em class="text-gray-500">${v.label}</em>`;
        variables.value[v.variableName] = '';
      });
    }
  }
  
  async function onCreateInvoice() {
    const generatedHtml = generateHtmlFromTemplate(previewHtml.value, variables.value);
  
    const payload = {
      templateId: selectedTemplateId.value,
      clientId: selectedClientId.value,
      variables: variables.value,
      issuedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      generatedHtml: generatedHtml,
      status: 'draft'
    };
  
    const invoice = await invoiceStore.createInvoice(payload);
    if (invoice) {
      router.push({
        name: 'InvoiceList',
        state: { toastStatus: 'success', toastMessage: `La facture #${invoice.number} a été créée avec succès.` }
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
  </script>
  