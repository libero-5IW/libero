<template>
  <v-card class="pa-6">
    <v-card-title class="text-primary" aria-level="2" role="heading">
      Paramètres de sécurité
    </v-card-title>
    <div class="text-body-2 text-medium-emphasis px-4 mb-2">
            Protégez votre compte avec une validation en deux étapes via une application comme Google Authenticator.
    </div>
    <v-divider class="mb-6" />
    <div>
      <v-card-text class="text-subtitle-1 font-weight-medium text-center mb-4">
        Authentification à deux facteurs (2FA)
      </v-card-text>
      <div class="d-flex justify-center">
        <TwoFactorSetup />
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import TwoFactorSetup from '@/components/Auth/TwoFactorSetup.vue'
</script>
