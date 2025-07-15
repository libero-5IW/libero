<template>
  <v-card class="pa-6" aria-label="Formulaire de modification du profil">
    <v-card-title class="text-primary text-2xl font-bold mb-4" aria-level="2" role="heading">
      {{isEditing ? "Modifier mes informations" : "Afficher mes informations"}}
    </v-card-title>

    <template v-if="!isEditing" >
      <v-card-text v-if="user">
        <div class="text-lg font-semibold mb-4">Informations personnelles</div>
        <div class="mb-2"><strong>Prénom:</strong> {{ user.firstName }}</div>
        <div class="mb-2"><strong>Nom:</strong> {{ user.lastName }}</div>
        <div class="mb-2"><strong>Email:</strong> {{ user.email }}</div>
        <v-divider class="my-4" />
        <div class="text-lg font-semibold mb-4">Informations de la société</div>
        <div class="mb-2"><strong>Nom de la société:</strong> {{ user.companyName }}</div>
        <div class="mb-2"><strong>Statut juridique:</strong> {{ getLegalStatusLabel(user.legalStatus) }}</div>
        <div class="mb-2"><strong>Numéro SIRET:</strong> {{ user.siret }}</div>
        <div class="mb-2"><strong>Numéro TVA:</strong> {{ user.tvaNumber ?? '' }}</div>
        <v-divider class="my-4" />
        <div class="text-lg font-semibold mb-4">Adresse</div>
        <div class="mb-2"><strong>Adresse:</strong> {{ user.addressLine }}</div>
        <div class="mb-2"><strong>Ville:</strong> {{ user.city }}</div>
        <div class="mb-2"><strong>Code postal:</strong> {{ user.postalCode }}</div>
        <div class="mb-2"><strong>Pays:</strong> {{ user.country }}</div>
      </v-card-text>
      <v-card-actions class="pt-4">
        <v-spacer />
        <v-btn color="primary" @click="startEdit">Modifier</v-btn>
      </v-card-actions>
    </template>

    <template v-else>
      <v-form @submit.prevent="saveProfile" v-model="isFormValid" aria-label="Formulaire utilisateur">

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="profile.firstName"
                label="Prénom"
                :rules="firstNameRules()"
                required
                autocomplete="given-name"
                aria-required="true"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="profile.lastName"
                label="Nom"
                :rules="lastNameRules()"
                required
                autocomplete="family-name"
                aria-required="true"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="profile.email"
            label="Adresse email"
            type="email"
            :rules="emailRules()"
            required
            autocomplete="email"
            aria-required="true"
          />

          <v-divider class="my-4"  role="separator" aria-hidden="true"  />
          <h2 class="text-lg font-semibold mb-4" aria-level="3" role="heading">Informations de la société</h2>

          <v-text-field
            v-model="profile.companyName"
            label="Nom de la société"
            :rules="companyNameRules()"
            required
            aria-required="true"
          />

          <v-select
            v-model="profile.legalStatus"
            :items="legalStatus"
            item-title="label"
            item-value="code"
            label="Statut juridique"
            :rules="legalStatusRules()"
            required
            aria-required="true"
          />
          <v-text-field
            v-if="profile.legalStatus === 'Autre'"
            v-model="profile.customLegalStatus"
            label="Précisez votre statut juridique"
            required
            :rules="[v => !!v || 'Veuillez préciser votre statut juridique.']"
          />

          <v-text-field
            v-model="profile.siret"
            label="Numéro SIRET"
            :rules="siretRules()"
            required
            aria-required="true"
          />

          <v-text-field
            v-model="profile.tvaNumber"
            label="Numéro TVA"
            autocomplete="off"
          />

          <v-divider class="my-4" role="separator" aria-hidden="true" />
          <h2  class="text-lg font-semibold mb-4" aria-level="3" role="heading">Adresse</h2>

          <v-text-field
            v-model="profile.addressLine"
            label="Adresse"
            :rules="addressLineRules()"
            required
            autocomplete="street-address"
            aria-required="true"
          />

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="profile.city"
                label="Ville"
                :rules="cityRules()"
                required
                autocomplete="address-level2"
                aria-required="true"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="profile.postalCode"
                label="Code postal"
                :rules="postalCodeRules()"
                required
                autocomplete="postal-code"
                aria-required="true"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="profile.country"
                label="Pays"
                :rules="countryRules()"
                required
                autocomplete="country"
                aria-required="true"
              />
            </v-col>
          </v-row>
      </v-card-text>

        <v-card-actions class="pt-4 d-flex gap-4 justify-end">
          <v-spacer />
          <v-btn color="primary" variant="flat" class="px-4 py-2"  @click="cancelEdit" :disabled="isLoading">
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            type="submit"
            variant="flat"
            class="px-4 py-2"
            :loading="isLoading"
            :disabled="!isFormValid"
            aria-label="Enregistrer les modifications du profil"
            >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-form>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { handleError } from '@/utils/handleError'
import { useToastHandler } from '@/composables/useToastHandler'
import { legalStatus } from '@/constants/legal-status'
import {
  addressLineRules,
  cityRules,
  companyNameRules,
  countryRules,
  emailRules,
  firstNameRules,
  lastNameRules,
  legalStatusRules,
  postalCodeRules,
  siretRules,

} from '@/utils/registrationValidationRules'
import type { ToastStatus } from '@/types'
const userStore = useUserStore()
const { showToast } = useToastHandler()
const isFormValid = ref(false)
const isLoading = ref(false)
const isEditing = ref(false)
const user = computed(() => userStore.user)

const profile = reactive({
  firstName: '',
  lastName: '',
  email: '',
  companyName: '',
  addressLine: '',
  postalCode: '',
  city: '',
  country: '',
  legalStatus: '',
  customLegalStatus: '',
  siret: '',
  tvaNumber: '',
})

let lastLoadedProfile: any = {}

onMounted(() => {
  const status = history.state?.toastStatus as ToastStatus;
  const message = history.state?.toastMessage as string;

  if (message && status) {
    showToast(status, message);

    history.replaceState(
      { ...history.state, toastStatus: null, toastMessage: null },
      ''
    );
  }
})

const updateProfileFromUser = (user: any) => {
  if (!user) return
  Object.assign(profile, {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    companyName: user.companyName,
    addressLine: user.addressLine,
    postalCode: user.postalCode,
    city: user.city,
    country: user.country,
    legalStatus: legalStatus.some(l => l.code === user.legalStatus) ? user.legalStatus : 'Autre',
    customLegalStatus: legalStatus.some(l => l.code === user.legalStatus) ? '' : user.legalStatus,
    siret: user.siret,
    tvaNumber: user.tvaNumber || '',
  })
  lastLoadedProfile = { ...profile }
}

const loadUserData = async () => {
    isLoading.value = true
    await userStore.fetchCurrentUser()
    updateProfileFromUser(userStore.user)
    isLoading.value = false
}

const startEdit = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  Object.assign(profile, lastLoadedProfile)
  isEditing.value = false
}

const saveProfile = async () => {
  if (!isFormValid.value) {
    showToast('error', 'Veuillez remplir correctement tous les champs obligatoires.')
    return
  }
  if (profile.legalStatus === 'Autre' && !profile.customLegalStatus.trim()) {
    showToast('error', 'Veuillez préciser votre statut juridique.')
    return
  }
  try {
    isLoading.value = true
    const updateData = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      companyName: profile.companyName,
      addressLine: profile.addressLine,
      postalCode: profile.postalCode,
      city: profile.city,
      country: profile.country,
      legalStatus: profile.legalStatus === 'Autre' ? profile.customLegalStatus.trim() : profile.legalStatus,
      siret: profile.siret,
      tvaNumber: profile.tvaNumber || undefined,
    }
    await userStore.updateProfile(updateData)
    updateProfileFromUser(userStore.user)
    showToast('success', 'Vos informations ont été mises à jour avec succès')
    isEditing.value = false
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      showToast('error', 'Certains champs sont invalides. Veuillez vérifier vos informations.')
    } else if (error.response && error.response.status === 401) {
      showToast('error', 'Vous devez être connecté pour modifier votre profil.')
    } else {
      showToast('error', 'Erreur lors de la sauvegarde des données')
    }
    handleError(error, 'Erreur lors de la sauvegarde des données')
  } finally {
    isLoading.value = false
  }
}

loadUserData()

function getLegalStatusLabel(code: string): string {
  const found = legalStatus.find(item => item.code === code)
  return found ? found.label : code
}
</script>
