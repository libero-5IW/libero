<template>
  <v-navigation-drawer
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :permanent="permanent"
    color="navbar"
    location="left"
    width="250"
    class="transition-transform duration-300 ease-in-out"
  >
    <div class="d-flex flex-column h-full">
      <div>
        <div class="mt-6 mb-10 p-4"  v-if="lgAndUp">
          <img src="@/assets/logo1.png" alt="Logo" class="w-1/3 h-auto mx-auto" />
        </div>

        <v-list class=" mb-2 border-b border-gray-200">
          <v-list-item
            class="rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <v-avatar size="32" color="surface">
                <v-icon color="primary">mdi-account</v-icon>
              </v-avatar>

              <div class="flex flex-col leading-tight ml-4">
                <span class="text-xs text-gray-500">Mon compte</span>
                <span class="font-medium text-sm">{{ userFullName }}</span>
              </div>
            </div>
          </v-list-item>
        </v-list>
        <v-list>
          <NavItemSingle title="Tableau de bord" to="/dashboard" icon="mdi-view-dashboard" />
          
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

          <NavGroupAccordian
            v-model="activeGroup"
            group-value="clients"
            main-title="Clients"
            main-icon="mdi-account-multiple"
            :items="clientItems"
          />

           <NavItemSingle title="Simulateur" to="/simulateur" icon="mdi-view-dashboard" />


        </v-list>
      </div>
      <v-spacer />
      <div>
        <v-list>
          <NavItemSingle title="Aide" to="/help" icon="mdi-help-circle-outline" />
          <NavItemSingle title="Paramètres" to="/settings" icon="mdi-cog" />
          <NavGroupAccordian
            v-model="activeGroup"
            group-value="legal"
            main-title="Légal"
            main-icon="mdi-file-document-outline"
            :items="legalItems"
          />
            <v-list-item @click="logout" class="px-5 mb-2 mt-4 border-t border-gray-200 text-black">
              <template #prepend>
                <v-icon size="18" class="mr-0">mdi-logout</v-icon>
              </template>
              <v-list-item-title> 
                <span class="text-m font-medium">Déconnexion</span>
              </v-list-item-title>
            </v-list-item>
        </v-list>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import NavGroupAccordian from './NavGroupAccordian.vue'
import NavItemSingle from './NavItemSingle.vue'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';

  defineProps<{
    modelValue?: boolean
    permanent?: boolean
  }>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const activeGroup = ref<string | null>(null)
const router = useRouter()
const { lgAndUp } = useDisplay()
const authStore = useAuthStore()
const userStore = useUserStore()

const userFullName = computed(()=> {
  const firstName = userStore.user?.firstName;
  const lastName = userStore.user?.lastName;
  return lastName?.toUpperCase() + ' ' + firstName
})

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

  const clientItems = [
    { 
      title: 'Liste des clients',
      to: '/clients' },
    { 
      title: 'Nouveau client',
      to: '/clients/new' }
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

  onMounted( async () => {
    await userStore.fetchCurrentUser()
    authStore.user?.userId
  })

  const logout = async () => {
    await authStore.logout();
  }
</script>

