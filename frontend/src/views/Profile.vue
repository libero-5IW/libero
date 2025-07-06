<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-4">
          <v-card-title class="text-h5 mb-4">
            Modifier mes informations
          </v-card-title>

          <template v-if="!isEditing">
            <v-card-text>
              <div class="mb-2"><strong>Prénom:</strong> {{ profile.firstName }}</div>
              <div class="mb-2"><strong>Nom:</strong> {{ profile.lastName }}</div>
              <div class="mb-2"><strong>Email:</strong> {{ profile.email }}</div>
              <v-divider class="my-4" />
              <div class="text-h6 mb-4">Informations de la société</div>
              <div class="mb-2"><strong>Nom de la société:</strong> {{ profile.companyName }}</div>
              <div class="mb-2"><strong>Statut juridique:</strong> {{ profile.legalStatus }}</div>
              <div class="mb-2"><strong>Numéro SIRET:</strong> {{ profile.siret }}</div>
              <div class="mb-2"><strong>Numéro TVA:</strong> {{ profile.tvaNumber }}</div>
              <v-divider class="my-4" />
              <div class="text-h6 mb-4">Adresse</div>
              <div class="mb-2"><strong>Adresse:</strong> {{ profile.addressLine }}</div>
              <div class="mb-2"><strong>Ville:</strong> {{ profile.city }}</div>
              <div class="mb-2"><strong>Code postal:</strong> {{ profile.postalCode }}</div>
              <div class="mb-2"><strong>Pays:</strong> {{ profile.country }}</div>
            </v-card-text>
            <v-card-actions class="pt-4">
              <v-spacer />
              <v-btn color="primary" @click="startEdit">Modifier</v-btn>
            </v-card-actions>
          </template>

          <template v-else>
            <v-form @submit.prevent="saveProfile" v-model="isFormValid">
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="profile.firstName"
                      label="Prénom"
                      :rules="[rules.required]"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="profile.lastName"
                      label="Nom"
                      :rules="[rules.required]"
                      required
                    />
                  </v-col>
                </v-row>

                <v-text-field
                  v-model="profile.email"
                  label="Adresse email"
                  type="email"
                  :rules="[rules.required, rules.email]"
                  required
                />

                <v-divider class="my-4" />
                <div class="text-h6 mb-4">Informations de la société</div>

                <v-text-field
                  v-model="profile.companyName"
                  label="Nom de la société"
                  :rules="[rules.required]"
                  required
                />

                <v-text-field
                  v-model="profile.siret"
                  label="Numéro SIRET"
                  :rules="[rules.required, rules.siret]"
                  required
                />

                <v-text-field
                  v-model="profile.tvaNumber"
                  label="Numéro TVA"
                />

                <v-divider class="my-4" />
                <div class="text-h6 mb-4">Adresse</div>

                <v-text-field
                  v-model="profile.addressLine"
                  label="Adresse"
                  :rules="[rules.required]"
                  required
                />

                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="profile.city"
                      label="Ville"
                      :rules="[rules.required]"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model="profile.postalCode"
                      label="Code postal"
                      :rules="[rules.required]"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model="profile.country"
                      label="Pays"
                      :rules="[rules.required]"
                      required
                    />
                  </v-col>
                </v-row>
              </v-card-text>

              <v-card-actions class="pt-4">
                <v-spacer />
                <v-btn color="primary" type="submit" :loading="isLoading" :disabled="!isFormValid">
                  Enregistrer
                </v-btn>
                <v-btn color="secondary" @click="cancelEdit" :disabled="isLoading">
                  Annuler
                </v-btn>
              </v-card-actions>
            </v-form>
          </template>

        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/config/axios'
import { handleError } from '@/utils/handleError'
import { useToastHandler } from '@/composables/useToastHandler'

const authStore = useAuthStore()
const { showToast } = useToastHandler()
const isFormValid = ref(false)
const isLoading = ref(false)
const isEditing = ref(false)

const rules = {
  required: (v: any) => !!v || 'This field is required',
  email: (v: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return !v || pattern.test(v) || 'Please enter a valid email'
  },
  siret: (v: string) => {
    const pattern = /^\d{14}$/
    return !v || pattern.test(v) || 'SIRET must contain exactly 14 digits'
  }
}

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
  siret: '',
  tvaNumber: ''
})

// Store the last loaded data for cancel
let lastLoadedProfile: any = {}

const loadUserData = async () => {
  try {
    isLoading.value = true
    const response = await apiClient.get('/users/me')
    const userData = response.data
    Object.assign(profile, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      companyName: userData.companyName,
      addressLine: userData.addressLine,
      postalCode: userData.postalCode,
      city: userData.city,
      country: userData.country,
      legalStatus: userData.legalStatus,
      siret: userData.siret,
      tvaNumber: userData.tvaNumber || ''
    })
    // Save a copy for cancel
    lastLoadedProfile = { ...profile }
  } catch (error) {
    console.error('Error loading user data:', error)
    handleError(error, 'Erreur lors du chargement des données')
  } finally {
    isLoading.value = false
  }
}

const startEdit = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  // Reset profile to last loaded data
  Object.assign(profile, lastLoadedProfile)
  isEditing.value = false
}

const saveProfile = async () => {
  if (!isFormValid.value) {
    showToast('error', 'Veuillez remplir correctement tous les champs obligatoires.')
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
      legalStatus: profile.legalStatus,
      siret: profile.siret,
      tvaNumber: profile.tvaNumber || undefined 
    }

    await apiClient.patch('/users/me', updateData)
    showToast('success', 'Vos informations ont été mises à jour avec succès')
    // Save a copy for cancel
    lastLoadedProfile = { ...profile }
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
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}
</style>