<template>
  <v-card class="pa-6">
    <v-card-title class="text-primary" aria-level="2" role="heading">
      Supprimer mon compte
    </v-card-title>

    <div class="text-body-2 text-medium-emphasis px-4 mb-2">
      La suppression de votre compte est irréversible. Toutes vos données seront définitivement supprimées.
    </div>

    <v-divider class="mb-6" />

    <v-card-text class="text-subtitle-1 font-weight-medium text-center mb-6">
      Vous êtes sur le point de supprimer votre compte.
    </v-card-text>

    <div class="d-flex justify-center">
      <v-btn
        color="error"
        variant="flat"
        class="px-6 py-3"
        @click="showDeleteModal = true"
        aria-label="Supprimer mon compte"
      >
        Supprimer définitivement mon compte
      </v-btn>
    </div>

    <ConfirmationModal
      v-model="showDeleteModal"
      title="Confirmer la suppression"
      message="Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
      confirmText="Supprimer"
      confirmColor="error"
      cancelText="Annuler"
      @confirm="handleDelete"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import ConfirmationModal from '@/components/Modals/ConfirmationModal.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const showDeleteModal = ref(false)
const userStore = useUserStore()
const authStore = useAuthStore()
const router = useRouter();

const handleDelete = async () => {
    const user = await userStore.deleteAccount()
    if (user) {
        authStore.skipNextUnauthorized = true
        await authStore.logout({
        status: 'success',
        message: `Votre compte avec l'email ${user.email} a bien été supprimé.`
        })
    }
}
</script>
