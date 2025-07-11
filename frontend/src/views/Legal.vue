<template>
  <v-container class="py-8">
    <v-card class="pa-6 elevation-2">
      <v-card-title class="text-h5 font-weight-bold mb-4">
        Documents légaux
      </v-card-title>
      <v-divider class="mb-6" />
      <v-list>
        <v-list-item to="/legal/cgu" link>
          <v-list-item-title>Conditions Générales d’Utilisation (CGU)</v-list-item-title>
        </v-list-item>
        <v-list-item to="/legal/mentions-legales" link>
          <v-list-item-title>Mentions légales</v-list-item-title>
        </v-list-item>
        <v-list-item to="/legal/politique-confidentialite" link>
          <v-list-item-title>Politique de confidentialité</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
</script> 