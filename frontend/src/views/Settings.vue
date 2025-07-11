<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-6 elevation-2">
          <v-card-title class="text-h5 font-weight-bold mb-2">
            Paramètres de sécurité
          </v-card-title>
          <v-divider class="mb-6" />
          <div>
            <h3 class="text-subtitle-1 font-weight-medium mb-4">
              Authentification à deux facteurs (2FA)
            </h3>
            <TwoFactorSetup />
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import TwoFactorSetup from '@/components/Auth/TwoFactorSetup.vue'
</script>
