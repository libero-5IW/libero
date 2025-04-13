<template>
    <v-card flat class="p-4">
      <h3 class="text-lg font-semibold mb-2">
        {{ variable.label }}
      </h3>
  
      <div class="text-sm mb-2">
        <strong>Nom interne :</strong> 
        {{ variable.variableName }}
      </div>

      <div class="text-sm mb-2">
        <strong>Type :</strong> 
        {{ variable.type }}
      </div>

      <div class="text-sm">
        <strong>Requis :</strong>
        {{ variable.required ? 'Oui' : 'Non' }}
      </div>
    </v-card>
</template>
  
<script setup lang="ts" generic="V extends VariableBase">
import type { VariableBase } from '@/types';
import type { QuoteTemplateVariable } from '@/schemas/quoteTemplate.schema'
  
  defineProps<{
    variable: V
  }>()
  </script>
  