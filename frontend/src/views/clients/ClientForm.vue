<template>
  <div class="p-4 max-w-lg mx-auto">
    <h1 class="text-xl font-bold mb-4">
      {{ isEditing ? 'Modifier un client' : 'Créer un client' }}
    </h1>
    <form @submit.prevent="onSubmit">
      <div class="mb-4">
        <label class="block mb-1">Prénom</label>
        <input v-model="form.firstName" type="text" class="border p-2 rounded w-full" />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Nom</label>
        <input v-model="form.lastName" type="text" class="border p-2 rounded w-full" />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Email</label>
        <input v-model="form.email" type="email" class="border p-2 rounded w-full" />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Téléphone</label>
        <input v-model="form.phoneNumber" type="text" class="border p-2 rounded w-full" />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Adresse</label>
        <input v-model="form.addressLine" type="text" class="border p-2 rounded w-full" />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Code postal</label>
        <input v-model="form.postalCode" type="text" class="border p-2 rounded w-full" />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Ville</label>
        <input v-model="form.city" type="text" class="border p-2 rounded w-full" />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Pays</label>
        <input v-model="form.country" type="text" class="border p-2 rounded w-full" />
      </div>
      <div class="flex justify-end space-x-2">
        <router-link to="/clients" class="text-gray-600">Annuler</router-link>
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">
          {{ isEditing ? 'Mettre à jour' : 'Créer' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClientStore } from '@/stores/client'
import { useAuthStore } from '@/stores/auth'

const store = useClientStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const isEditing = !!route.params.id
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  addressLine: '',
  postalCode: '',
  city: '',
  country: 'France'
})

onMounted(async () => {
  if (isEditing) {
    await store.fetchClient(route.params.id)
    form.value = { ...store.currentClient }
  }
})

const onSubmit = async () => {
  if (!authStore.user) {
    alert('Erreur : utilisateur non connecté.')
    return
  }

  const payload = { ...form.value, userId: authStore.user.id }

  if (isEditing) {
    await store.updateClient(route.params.id, payload)
  } else {
    await store.createClient(payload)
  }
  await store.fetchAllClients()
  router.push('/clients')
}
</script>
