<template>
    <v-container fluid>
      <v-row dense>
        <v-col cols="12" md="8">
          <v-card flat class="mb-4 pa-4">
            <!-- 1️⃣ Sélection du template -->
            <v-select
              v-model="selectedTemplateId"
              :items="templates"
              item-title="name"
              item-value="id"
              label="Sélectionner un template"
              @update:modelValue="onTemplateChange"
            />
  
            <!-- Affichage conditionnel -->
            <div v-if="selectedTemplateId">
  
              <!-- 🟢 Infos Freelancer -->
              <h3 class="mb-2">Informations du Freelance</h3>
              <div 
                v-for="variable in orderedTemplateVariables.filter(v => 
                  v.variableName.startsWith('freelancer_')
                )" 
                :key="variable.variableName" 
                class="mb-3"
              >
                <v-text-field
                  v-model="variables[variable.variableName]"
                  :label="variable.label"
                  :type="mapType(variable.type)"
                  :required="variable.required"
                />
              </div>
  
              <!-- 🟢 Sélection et Infos Client -->
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
                  v-model="variables[variable.variableName]"
                  :label="variable.label"
                  :type="mapType(variable.type)"
                  :required="variable.required"
                />
              </div>
  
              <!-- 🟢 Autres champs -->
              <h3 class="mt-6 mb-2">Autres Informations</h3>
              <div 
                v-for="variable in orderedTemplateVariables.filter(v => 
                  !v.variableName.startsWith('freelancer_') &&
                  !v.variableName.startsWith('client_') &&
                  v.variableName !== 'invoice_number'
                )" 
                :key="variable.variableName" 
                class="mb-3"
              >
                <v-text-field
                  v-model="variables[variable.variableName]"
                  :label="variable.label"
                  :type="mapType(variable.type)"
                  :required="variable.required"
                />
              </div>
  
              <!-- Bouton -->
              <v-btn color="primary" @click="onCreateInvoice" :disabled="!canCreate">
                <v-icon start>mdi-content-save</v-icon>
                Créer la facture
              </v-btn>
            </div>
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
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useInvoiceTemplateStore } from '@/stores/invoiceTemplate';
  import { useInvoiceStore } from '@/stores/invoice';
  import { useClientStore } from '@/stores/client';
  import { useUserStore } from '@/stores/user';
  import QuoteTemplatePreview from '@/components/ui/PreviewPdf.vue';
  import type { InvoiceTemplateVariable } from '@/schemas/invoiceTemplate.schema';
  
  const router = useRouter();
  const invoiceTemplateStore = useInvoiceTemplateStore();
  const invoiceStore = useInvoiceStore();
  const clientStore = useClientStore();
  const userStore = useUserStore();
  
  const selectedTemplateId = ref<string>('');
  const selectedClientId = ref<string>('');
  const templateVariables = ref<InvoiceTemplateVariable[]>([]);
  const variables = ref<Record<string, string>>({});
  
  const previewHtml = ref<string>('');
  const previewVariables = ref<Record<string, string>>({});
  
  const currentUser = computed(() => userStore.users[0]);
  
  onMounted(async () => {
    await invoiceTemplateStore.fetchAllTemplates();
    await clientStore.fetchAllClients();
    await userStore.fetchUsers();
  });
  
  const templates = computed(() => invoiceTemplateStore.templates);
  const clients = computed(() =>
    clientStore.clients.map(client => ({
      id: client.id,
      fullName: `${client.firstName} ${client.lastName}`,
    }))
  );
  
  const canCreate = computed(() => selectedTemplateId.value && selectedClientId.value && currentUser.value);
  
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

    if (template.variables.some(v => v.variableName === 'invoice_number')) {
  const nextNumber = await invoiceStore.fetchNextInvoiceNumber();
  if (nextNumber !== null) {
    variables.value['invoice_number'] = `${nextNumber}`;
  }
}

    if (currentUser.value) {
      if ('freelancer_name' in variables.value) {
        variables.value['freelancer_name'] = `${currentUser.value.firstName} ${currentUser.value.lastName}`;
      }

      if ('freelancer_address' in variables.value) {
        variables.value['freelancer_address'] = `${currentUser.value.addressLine}, ${currentUser.value.postalCode} ${currentUser.value.city}, ${currentUser.value.country}`;
      }

      if ('freelancer_siret' in variables.value) {
        variables.value['freelancer_siret'] = currentUser.value.siret;
      }
    }
  }
}

  
  async function onCreateInvoice() {
    if (!currentUser.value) {
      alert("Utilisateur non chargé !");
      return;
    }
  
    const generatedHtml = generateHtmlFromTemplate(previewHtml.value, variables.value);
  
    const payload = {
      templateId: selectedTemplateId.value,
      clientId: selectedClientId.value,
      userId: currentUser.value.id,
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
  
  watch(variables, (newVars) => {
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
    if ('client_name' in variables.value) {
      variables.value['client_name'] = `${client.firstName} ${client.lastName}`;
    }
    if ('client_address' in variables.value) {
      variables.value['client_address'] = `${client.addressLine}, ${client.postalCode} ${client.city}, ${client.country}`;
    }
  }
});

</script>
  