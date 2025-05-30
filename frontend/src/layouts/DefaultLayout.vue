<template>
  <v-app>
    <NavBar />
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar/NavBar.vue'
</script> 