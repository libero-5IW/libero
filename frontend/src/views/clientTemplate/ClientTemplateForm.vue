<template>
  <v-container fluid class="d-flex justify-center">
    <v-row dense class="w-full" style="max-width: 800px;">
      <v-col cols="12">
        <v-card flat class="pa-4 mb-4">
          <h2 class="text-lg font-semibold mb-4">
            {{ isEdit ? 'Modifier un client' : 'Créer un client' }}
          </h2>

          <v-form @submit.prevent="onSubmit">
            <v-text-field v-model="form.firstName" label="Prénom" required />
            <v-text-field v-model="form.lastName" label="Nom" required />
            <v-text-field v-model="form.email" label="Email" type="email" />
            <v-text-field v-model="form.phoneNumber" label="Téléphone" />
            <v-text-field v-model="form.addressLine" label="Adresse" />
            <v-text-field v-model="form.postalCode" label="Code postal" />
            <v-text-field v-model="form.city" label="Ville" />
            <v-text-field v-model="form.country" label="Pays" />

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
import { reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClientStore } from '@/stores/client'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const clientStore = useClientStore()
const authStore = useAuthStore()

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

onMounted(async () => {
  if (isEdit.value && route.params.id) {
    await clientStore.fetchClient(route.params.id as string)
    Object.assign(form, clientStore.currentClient || {})
  }
})

const onSubmit = async () => {
  if (!authStore.user?.userId) {
    alert('Utilisateur non connecté')
    return
  }

  const payload = {
    ...form,
    userId: authStore.user.userId,
  }

  if (isEdit.value) {
    await clientStore.updateClient(route.params.id as string, payload)
  } else {
    await clientStore.createClient(payload)
  }

  await clientStore.fetchAllClients()
  router.push({
    name: 'ClientTemplateList',
    state: {
      toastStatus: 'success',
      toastMessage: `Client ${form.firstName} ${form.lastName} ${isEdit.value ? 'modifié' : 'créé'} avec succès.`,
    },
  })
}

const cancel = () => {
  router.push({ name: 'ClientTemplateList' })
}
</script>
