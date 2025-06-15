<template>
  <v-card flat class="mb-4">
    <EditableHeader :title="'Créer un devis'" back-route-name="InvoiceList" /> 
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
    <div v-for="variable in props.templateVariables" :key="variable.variableName" class="mb-3">
      <v-text-field
        v-model="variables[variable.variableName]"
        :label="variable.label"
        :type="mapType(variable.type)"
        :required="variable.required"
      />
    </div>
  </v-card>

  <v-card flat class="text-right mt-4">
    <v-btn color="primary" @click="onCreateInvoice">
      <v-icon start>mdi-content-save</v-icon>
      Créer la facture
    </v-btn>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import EditableHeader from '@/components/TemplateEditor/EditableHeader.vue';
import { useInvoiceStore } from '@/stores/invoice';
import { useClientStore } from '@/stores/client';  
import type { InvoiceTemplateVariable } from '@/schemas/invoiceTemplate.schema';
import { useUserStore } from '@/stores/user';


const props = defineProps<{
  templateVariables: InvoiceTemplateVariable[];
  templateId: string;
}>();

const emit = defineEmits(['invoiceCreated']);
    // {# GENERIQUE NE PAS METTRE LES ROUTES ICI #}
const selectedClientId = ref<string>('');
const variables = ref<Record<string, string>>({});

const invoiceStore = useInvoiceStore();
const clientStore = useClientStore();

const userStore = useUserStore();
const currentUser = computed(() => userStore.user);

const clients = computed(() =>
  clientStore.clients.map(client => ({
    id: client.id,
    name: `${client.firstName} ${client.lastName}`,
  }))
);

function mapType(type: string) {
  if (type === 'number') return 'number';
  if (type === 'date') return 'date';
  return 'text';
}

async function onCreateInvoice() {
  const payload = {
    templateId: props.templateId,
    clientId: selectedClientId.value,
    userId: currentUser.value?.id,
    variables: variables.value,
    issuedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),  
  };

  const invoice = await invoiceStore.createInvoice(payload);
  emit('invoiceCreated', invoice);
}

onMounted(async () => {
  await clientStore.fetchAllClients();
});
</script>
