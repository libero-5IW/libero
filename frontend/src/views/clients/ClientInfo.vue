<template>
  <v-container
    fluid
    class="d-flex justify-center mt-8"
    role="main"
    aria-labelledby="client-info-title"
    tabindex="-1"
    ref="mainContent"
  >
    <h1 id="client-info-title" class="sr-only">Informations du client</h1>

    <v-row dense class="w-full" style="max-width: 800px;">
      <v-col cols="12">
        <v-card flat class="pa-4 mb-4" aria-label="Fiche client">
            <div class="flex items-center justify-between mb-8">
                <ButtonBack />
                <h2 class="text-lg font-semibold text-center flex-1">
                    Fiche client
                </h2>
                <div />
            </div>

          <v-form>
            <v-text-field
              class="mb-4 pointer-events-none text-primary"
              :model-value="form.firstName"
              label="Prénom"
              readonly
            />
            <v-text-field
              class="mb-4 pointer-events-none text-primary"
              :model-value="form.lastName"
              label="Nom"
              readonly
            />
            <v-text-field
              class="mb-4 pointer-events-none text-primary"
              :model-value="form.email"
              label="Email"
              readonly

            />
            <v-text-field
              class="mb-4  pointer-events-none text-primary"
              :model-value="form.phoneNumber"
              label="Téléphone"
              readonly
            />
            <v-text-field
              class="mb-4 pointer-events-none text-primary"
              :model-value="form.addressLine"
              label="Adresse"
              readonly
            />
            <v-text-field
              class="mb-4 pointer-events-none text-primary"
              :model-value="form.postalCode"
              label="Code postal"
              readonly
            />
            <v-text-field
              class="mb-4 pointer-events-none text-primary"
              :model-value="form.city"
              label="Ville"
              readonly
            />
            <v-text-field
              :model-value="form.country"
              class="pointer-events-none text-primary"
              label="Pays"
              readonly
            />
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useClientStore } from '@/stores/client'
import { useToastHandler } from '@/composables/useToastHandler'
import ButtonBack from '@/components/Buttons/ButtonBack.vue'

const route = useRoute()
const clientStore = useClientStore()
const { showToast } = useToastHandler()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  addressLine: '',
  postalCode: '',
  city: '',
  country: 'France',
})

onMounted(async () => {
  try {
    const clientId = route.params.id as string
    await clientStore.fetchClient(clientId)
    Object.assign(form, clientStore.currentClient || {})
  } catch {
    showToast('error', 'Erreur lors du chargement du client.')
  }
})
</script>
