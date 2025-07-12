<template>
  <v-app>
    <!-- Responsive app bar -->
    <v-app-bar
      color="surface"
      elevation="1"
      v-if="!mdAndUp"
    >
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title class="mr-4">Libero</v-app-bar-title>
    </v-app-bar>

    <!-- Responsive navigation drawer -->
    <VerticalNavBar 
      v-model="drawer"
      :permanent="mdAndUp"
    />

    <v-main class="bg-background">
      <v-container 
        fluid
        :class="{ 'pa-2': !mdAndUp, 'pa-4': mdAndUp }"
        class="my-4"
      >
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDisplay } from 'vuetify'
import VerticalNavBar from '@/components/NavBar/VerticalNavBar.vue'

const { mdAndUp } = useDisplay()
const drawer = ref(true)

</script>