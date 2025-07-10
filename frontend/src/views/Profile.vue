<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="rounded-xl">
          <v-card-title class="text-2xl font-bold mb-4 text-indigo-900">
            Modifier mes informations
          </v-card-title>

          <template v-if="!isEditing">
            <v-card-text>
              <div class="mb-2"><strong>Prénom:</strong> {{ profile.firstName }}</div>
              <div class="mb-2"><strong>Nom:</strong> {{ profile.lastName }}</div>
              <div class="mb-2"><strong>Email:</strong> {{ profile.email }}</div>
              <v-divider class="my-4" />
              <div class="text-lg font-semibold mb-4">Informations de la société</div>
              <div class="mb-2"><strong>Nom de la société:</strong> {{ profile.companyName }}</div>
              <div class="mb-2"><strong>Statut juridique:</strong> {{ getLegalStatusLabel(profile.legalStatus) }}</div>
              <div class="mb-2"><strong>Numéro SIRET:</strong> {{ profile.siret }}</div>
              <div class="mb-2"><strong>Numéro TVA:</strong> {{ profile.tvaNumber }}</div>
              <v-divider class="my-4" />
              <div class="text-lg font-semibold mb-4">Adresse</div>
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
                <div class="text-lg font-semibold mb-4">Informations de la société</div>

                <v-text-field
                  v-model="profile.companyName"
                  label="Nom de la société"
                  :rules="[rules.required]"
                  required
                />

                <v-select
                  v-model="profile.legalStatus"
                  :items="legalStatus"
                  item-title="label"
                  item-value="code"
                  label="Statut juridique"
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
                <div class="text-lg font-semibold mb-4">Adresse</div>

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
import { ref, reactive, computed, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { handleError } from '@/utils/handleError'
import { useToastHandler } from '@/composables/useToastHandler'
import { legalStatus } from '@/constants/legal-status'

const userStore = useUserStore()
const { showToast } = useToastHandler()
const isFormValid = ref(false)
const isLoading = ref(false)
const isEditing = ref(false)

const rules = {
  required: (v: any) => !!v || 'Ce champ est obligatoire',
  email: (v: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return !v || pattern.test(v) || 'Veuillez entrer un email valide'
  },
  siret: (v: string) => {
    const pattern = /^\d{14}$/
    return !v || pattern.test(v) || 'Le SIRET doit contenir exactement 14 chiffres'
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
  tvaNumber: '',
})

let lastLoadedProfile: any = {}

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
    legalStatus: user.legalStatus,
    siret: user.siret,
    tvaNumber: user.tvaNumber || '',
  })
  lastLoadedProfile = { ...profile }
}

const loadUserData = async () => {
  try {
    isLoading.value = true
    await userStore.fetchCurrentUser()
    updateProfileFromUser(userStore.user)
  } catch (error) {
    handleError(error, 'Erreur lors du chargement des données')
  } finally {
    isLoading.value = false
  }
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
