<template>
  <v-container fluid class="d-flex justify-center">
    <v-row dense class="w-full" style="max-width: 800px;">
      <v-col cols="12">
        <v-card flat class="pa-4 mb-4">
          <h2 class="text-lg font-semibold mb-4">
            {{ isEdit ? 'Modifier un client' : 'Créer un client' }}
          </h2>

          <v-form ref="formRef" @submit.prevent="onSubmit">
            <v-text-field
              v-model="form.firstName"
              label="Prénom"
              type="text"
              :rules="firstNameRules()"
              required
            />
            <v-text-field
              v-model="form.lastName"
              label="Nom"
              type="text"
              :rules="lastNameRules()"
              required
            />
            <v-text-field
              v-model="form.email"
              label="Email"
              type="email"
              :rules="emailRules()"
              required
            />
            <v-text-field
              v-model="form.phoneNumber"
              label="Téléphone"
              type="tel"
              :rules="phoneNumberRules()"
              required
            />
            <v-text-field
              v-model="form.addressLine"
              label="Adresse"
              type="text"
              :rules="addressLineRules()"
              required
            />
            <v-text-field
              v-model="form.postalCode"
              label="Code postal"
              type="text"
              :rules="postalCodeRules()"
              required
            />
            <v-text-field
              v-model="form.city"
              label="Ville"
              type="text"
              :rules="cityRules()"
              required
            />
            <v-text-field
              v-model="form.country"
              label="Pays"
              type="text"
              :rules="countryRules()"
              required
            />

            <div class="d-flex justify-between mt-6">
              <div v-if="isEdit" class="d-flex align-center">
                <v-btn color="error" variant="tonal" @click="showDeleteModal = true">
                  Supprimer
                </v-btn>
              </div>

              <div class="d-flex align-center">
                <v-btn text @click="cancel">Annuler</v-btn>
                <v-btn color="primary" type="submit" class="ml-2">
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
import { reactive, computed, onMounted, ref, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClientStore } from '@/stores/client'
import { useAuthStore } from '@/stores/auth'
import { useToastHandler } from '@/composables/useToastHandler'
import { phoneNumberRules } from '@/utils/validationRules'
import ConfirmationModal from '@/components/Modals/ConfirmationModal.vue'
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
const authStore = useAuthStore()
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

  if (!authStore.user?.userId) {
    showToast('error', 'Utilisateur non connecté.')
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

const removeClient = async (id: string) => {
    await clientStore.deleteClient(id)
    router.push({
        path: '/clients',
        state: {
          toastStatus: 'success',
          toastMessage: `Client ${form.firstName} ${form.lastName} supprimé avec succès.`
        }
    })}
</script>
