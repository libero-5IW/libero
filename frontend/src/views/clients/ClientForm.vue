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
              :rules="[rules.required]"
              required
            />
            <v-text-field
              v-model="form.lastName"
              label="Nom"
              type="text"
              :rules="[rules.required]"
              required
            />
            <v-text-field
              v-model="form.email"
              label="Email"
              type="email"
              :rules="[rules.required, rules.email]"
              required
            />
            <v-text-field
              v-model="form.phoneNumber"
              label="Téléphone"
              type="tel"
              :rules="[rules.required]"
              required
            />
            <v-text-field
              v-model="form.addressLine"
              label="Adresse"
              type="text"
              :rules="[rules.required]"
              required
            />
            <v-text-field
              v-model="form.postalCode"
              label="Code postal"
              type="text"
              :rules="[rules.required]"
              required
            />
            <v-text-field
              v-model="form.city"
              label="Ville"
              type="text"
              :rules="[rules.required]"
              required
            />
            <v-text-field
              v-model="form.country"
              label="Pays"
              type="text"
              :rules="[rules.required]"
              required
            />

            <div class="d-flex justify-end mt-6">
              <v-btn text @click="cancel">Annuler</v-btn>
              <v-btn color="primary" type="submit" class="ml-2">
                {{ isEdit ? 'Mettre à jour' : 'Créer' }}
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClientStore } from '@/stores/client'
import { useAuthStore } from '@/stores/auth'
import { useToastHandler } from '@/composables/useToastHandler'

const router = useRouter()
const route = useRoute()
const clientStore = useClientStore()
const authStore = useAuthStore()
const { showToast } = useToastHandler()

const formRef = ref()

const isEdit = computed(() => !!route.params.id)

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

const rules = {
  required: (v: string) => !!v || 'Ce champ est requis.',
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email invalide.'
}

onMounted(async () => {
  try {
    if (isEdit.value && route.params.id) {
      await clientStore.fetchClient(route.params.id as string)
      Object.assign(form, clientStore.currentClient || {})
    }
  } catch (error) {
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

  const payload = {
    ...form,
    userId: authStore.user.userId,
  }

  try {
    if (isEdit.value) {
      await clientStore.updateClient(route.params.id as string, payload)
    } else {
      await clientStore.createClient(payload)
    }

    try {
      await clientStore.fetchAllClients()
    } catch {
      showToast('error', 'Client enregistré, mais erreur lors de la mise à jour de la liste.')
    }

    router.push({
      name: 'ClientList',
      state: {
        toastStatus: 'success',
        toastMessage: `Client ${form.firstName} ${form.lastName} ${isEdit.value ? 'modifié' : 'créé'} avec succès.`,
      },
    })
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
</script>
