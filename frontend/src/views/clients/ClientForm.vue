<template>
  <v-container fluid class="d-flex justify-center mt-8" role="main" aria-labelledby="client-form-title" tabindex="-1" ref="mainContent">
    <h1 id="client-form-title" class="sr-only">
      {{ isEdit ? 'Modifier un client' : 'Créer un client' }}
    </h1>

    <v-row dense class="w-full" style="max-width: 800px;">
      <v-col cols="12">
        <v-card flat class="pa-4 mb-4" aria-label="Formulaire client">
          <div class="flex items-center justify-between mb-8">
              <ButtonBack />
              <h2 class="text-lg font-semibold mb-4" role="heading" aria-level="2">
                {{ isEdit ? 'Modifier un client' : 'Créer un client' }}
              </h2>
              <div />
          </div>


          <v-form ref="formRef" @submit.prevent="onSubmit" aria-label="Formulaire de création ou modification de client">
            <v-text-field
              class="mb-4"
              v-model="form.firstName"
              label="Prénom"
              type="text"
              :rules="firstNameRules()"
              required
              autocomplete="given-name"
              aria-required="true"
            />
            <v-text-field
              class="mb-4"
              v-model="form.lastName"
              label="Nom"
              type="text"
              :rules="lastNameRules()"
              required
              autocomplete="family-name"
              aria-required="true"
            />
            <v-text-field
              class="mb-4"
              v-model="form.email"
              label="Email"
              type="email"
              :rules="emailRules()"
              required
              autocomplete="email"
              aria-required="true"
            />
            <v-text-field
              class="mb-4"
              v-model="form.phoneNumber"
              label="Téléphone"
              type="tel"
              :rules="phoneNumberRules()"
              required
              autocomplete="tel"
              aria-required="true"
            />
            <v-text-field
              class="mb-4"
              v-model="form.addressLine"
              label="Adresse"
              type="text"
              :rules="addressLineRules()"
              required
              autocomplete="street-address"
              aria-required="true"
            />
            <v-text-field
              class="mb-4"
              v-model="form.postalCode"
              label="Code postal"
              type="text"
              :rules="postalCodeRules()"
              required
              autocomplete="postal-code"
              aria-required="true"
            />
            <v-text-field
              class="mb-4"
              v-model="form.city"
              label="Ville"
              type="text"
              :rules="cityRules()"
              required
              autocomplete="address-level2"
              aria-required="true"
            />
            <v-text-field
              v-model="form.country"
              label="Pays"
              type="text"
              :rules="countryRules()"
              required
              autocomplete="country"
              aria-required="true"
            />

            <div class="d-flex mt-6 align-center justify-space-between">
                <v-btn
                  color="error"
                  variant="tonal"
                  @click="showDeleteModal = true"
                  aria-label="Supprimer ce client"
                >
                  Supprimer
                </v-btn>
              
              <div class="d-flex align-center">
                <v-btn text @click="cancel" aria-label="Annuler la modification">Annuler</v-btn>
                <v-btn color="primary" type="submit" class="ml-2" :aria-label="isEdit ? 'Mettre à jour le client' : 'Créer le client'" :disabled="!formRef?.isValid" >
                  {{ isEdit ? 'Mettre à jour' : 'Créer' }}
                </v-btn>
              </div>
            </div>
          </v-form>
        </v-card>

        <ConfirmationModal
          v-model="showDeleteModal"
          title="Confirmer la suppression"
          message="Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible."
          confirmText="Supprimer"
          confirmColor="error"
          cancelText="Annuler"
          @confirm="removeClient"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClientStore } from '@/stores/client'
import { useToastHandler } from '@/composables/useToastHandler'
import { phoneNumberRules } from '@/utils/validationRules'
import ConfirmationModal from '@/components/Modals/ConfirmationModal.vue'
import ButtonBack from '@/components/Buttons/ButtonBack.vue'
import { 
    addressLineRules, 
    cityRules,  
    countryRules, 
    emailRules, 
    firstNameRules, 
    lastNameRules, 
    postalCodeRules } from '@/utils/registrationValidationRules'

const router = useRouter()
const route = useRoute()
const clientStore = useClientStore()
const { showToast } = useToastHandler()

const formRef = ref()
const showDeleteModal = ref(false)
const isEdit = ref(!!route.params.id)

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
    if (isEdit.value && route.params.id) {
      await clientStore.fetchClient(route.params.id as string)
      Object.assign(form, clientStore.currentClient || {})
    }
  } catch {
    showToast('error', 'Erreur lors du chargement du client.')
  }
})

const onSubmit = async () => {
  const result = await formRef.value?.validate()
  if (!result?.valid) {
    showToast('error', 'Veuillez remplir tous les champs correctement avant de valider.')
    return
  }

  try {
    const response = isEdit.value
      ? await clientStore.updateClient(route.params.id as string, form)
      : await clientStore.createClient(form)

    const editStatus = isEdit.value

    if (response) {
      router.push({
        path: '/clients',
        state: {
          toastStatus: 'success',
          toastMessage: `Client ${form.firstName} ${form.lastName} ${editStatus ? 'modifié' : 'créé'} avec succès.`
        }
      })
    }

  } catch (error: any) {
    if (error.response?.status === 409) {
      showToast('error', error.response.data.message || 'Ce client existe déjà.')
    } else {
      showToast('error', 'Une erreur est survenue lors de la sauvegarde.')
    }
  }
}

const cancel = () => {
  router.push({ name: 'ClientList' })
}

const removeClient = async () => {
    await clientStore.deleteClient(route.params.id as string)
    router.push({
        path: '/clients',
        state: {
          toastStatus: 'success',
          toastMessage: `Client ${form.firstName} ${form.lastName} supprimé avec succès.`
        }
    })}
</script>
