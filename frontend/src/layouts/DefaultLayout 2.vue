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
      
      <!-- Mobile search and icons -->
      <v-text-field
        prepend-inner-icon="mdi-magnify"
        placeholder="Search..."
        variant="solo-filled"
        density="compact"
        color="text-secondary"
        hide-details
        class="search-field mx-2 max-w-[150px] rounded-lg shadow-sm"
        bg-color="secondary-lighten-5"
      />

      <v-btn icon class="ml-2">
        <v-badge
          color="error"
          content="2"
          dot
        >
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
      </v-btn>

      <v-btn icon class="ml-2">
        <v-avatar size="32" color="primary">
          <v-icon>mdi-account</v-icon>
        </v-avatar>
      </v-btn>
    </v-app-bar>

    <!-- Responsive navigation drawer -->
    <VerticalNavBar 
      v-model="drawer"
      :permanent="mdAndUp"
    />

    <!-- Horizontal navigation bar -->
    <HorizontalNavBar v-if="mdAndUp" />

    <v-main class="bg-background">
      <v-container 
        fluid
        :class="{ 'pa-2': !mdAndUp, 'pa-4': mdAndUp }"
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
import HorizontalNavBar from '@/components/NavBar/HorizontalNavBar.vue'

const { mdAndUp } = useDisplay()
const drawer = ref(true)
</script>

<style scoped>
/* Removed: .search-field :deep(.v-field) { border-radius: 8px !important; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important; } */
</style> 