<template>
  <v-navigation-drawer
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :permanent="permanent"
    location="left"
    width="250"
    class="transition-transform duration-300 ease-in-out"
  >
    <div class="d-flex flex-column h-100 h-full">
      <div>
        <div class="p-4">
          <img src="@/assets/logo.png" alt="Logo" class="w-1/3 h-auto mx-auto" />
        </div>
        <v-list>
          <NavItemSingle title="Dashboard" to="/" icon="mdi-view-dashboard" />
          
          <NavGroupAccordian
            v-model="activeGroup"
            group-value="quote"
            main-title="Devis"
            main-icon="mdi-file-eye"
            :items="quoteItems"
           />

          <NavGroupAccordian
            v-model="activeGroup"
            group-value="contract"
            main-title="Contrats"
            main-icon="mdi-file-sign"
            :items="contractItems"
           />

          <NavGroupAccordian
            v-model="activeGroup"
            group-value="invoice"
            main-title="Factures"
            main-icon="mdi-invoice-list"
            :items="invoiceItems"
           />

           <NavItemSingle title="Simulateur" to="/simulateur" icon="mdi-view-dashboard" />


        </v-list>
      </div>
      <v-spacer />
      <div>
        <v-list>
          <NavGroupAccordian
            v-model="activeGroup"
            group-value="legal"
            main-title="Légal"
            main-icon="mdi-file-document-outline"
            :items="legalItems"
          />
        </v-list>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
import NavGroupAccordian from './NavGroupAccordian.vue'
  import NavItemSingle from './NavItemSingle.vue'

  defineProps<{
    modelValue?: boolean
    permanent?: boolean
  }>()

  defineEmits<{
    'update:modelValue': [value: boolean]
  }>()

  const activeGroup = ref<string | null>(null)

  const quoteItems = [
    {
      title: 'Liste des devis',
      to: '/quote',
    },
    {
      title: 'Liste des modèles',
      to: '/quote-template',
    }
  ]

  const contractItems = [
    {
      title: 'Liste des contrats',
      to: '/contract',
    },
    {
      title: 'Liste des modèles',
      to: '/contract-template',
    }
  ]

  const invoiceItems = [
    {
      title: 'Liste des factures',
      to: '/invoice',
    },
    {
      title: 'Liste des modèles',
      to: '/invoice-template',
    }
  ]

  const legalItems = [
    {
      title: 'CGU',
      to: '/legal/cgu',
    },
    {
      title: 'Mentions légales',
      to: '/legal/mentions-legales',
    },
    {
      title: 'Politique de confidentialité',
      to: '/legal/politique-confidentialite',
    },
  ]
</script>

