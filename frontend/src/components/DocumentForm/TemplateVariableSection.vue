<template>
  <div>
    <h3 class="mb-2">{{ title }}</h3>
    
    <v-select
      v-if="clients && clients.length"
      v-model="selectedClientId"
      :items="clients"
      item-title="fullName"
      item-value="id"
      label="Sélectionner un client"
      class="mb-4"
    />

    <div
      v-for="variable in variables"
      :key="variable.variableName"
      class="mb-3"
    >
      <component
        :is="getComponentType(variable.type)"
        :modelValue="getVariableValue(variable.variableName)"
        @update:modelValue="(val: string) => updateVariableValue(variable.variableName, val)"
        :label="variable.label"
        :type="mapInputType(variable.type)"
        :required="variable.required"
      />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends VariableBase">
import type { Client } from '@/schemas/client.schema';
import type { VariableBase, VariableValue } from '@/types';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  title: string;
  variables: T[];
  variablesValue: VariableValue[];
  clients?: Client[];
}>();

const clients = computed(() =>
    props.clients?.map(client => ({
      id: client.id,
      fullName: `${client.firstName} ${client.lastName}`,
    }))
);

const selectedClientId = defineModel<string>('selectedClientId');

const getComponentType = (type: string) => {
  return type === 'textarea' ? 'v-textarea' : 'v-text-field';
};

const mapInputType = (type: string) => {
  if (['number', 'date', 'email', 'url'].includes(type)) return type;
  return 'text';
};

const getVariableValue = (variableName: string): string => {
  return props.variablesValue.find(v => v.variableName === variableName)?.value || '';
};

const updateVariableValue = (variableName: string, newValue: string) => {
  const variable = props.variablesValue.find(v => v.variableName === variableName);
  if (variable) {
    variable.value = newValue;
  }
};

watch(selectedClientId, (id) => {
  const client = props.clients?.find(c => c.id === id);
  if (!client) return;

  updateVariableValue('client_name', `${client.firstName} ${client.lastName}`);
  updateVariableValue('client_address', `${client.addressLine}, ${client.postalCode} ${client.city}, ${client.country}`);
});

</script>
