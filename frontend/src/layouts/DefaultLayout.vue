<template>
  <v-app>
    <!-- Responsive app bar -->
    <v-app-bar
      color="appbar"
      elevation="1"
      v-if="!mdAndUp"
    >
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title class="mr-4">Libero</v-app-bar-title>
      
      <!-- Mobile search and icons -->
      <v-tooltip location="bottom end">
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            v-bind="props"
            @click="router.push('/help')"
          >
              <v-icon>mdi-help-circle-outline</v-icon>
          </v-btn>
        </template>
        <span>Aide</span>
      </v-tooltip>

  <v-menu
      v-model="showUserMenu"
      location="bottom end"
      offset="5"
    >
      <template v-slot:activator="{ props }">
        <v-btn 
          icon 
          v-bind="props"
          :class="{ 'mr-4': $vuetify.display.lgAndUp, 'mr-2': !$vuetify.display.lgAndUp }"
        >
          <v-avatar size="32" color="surface">
            <v-icon color="primary">mdi-account</v-icon>
          </v-avatar>
        </v-btn>
      </template>

      <v-card min-width="200">
        <v-list>
          <v-list-item
            prepend-icon="mdi-account-circle"
            title="Profil"
            value="profile"
            @click="handleUserMenuClick('profile')"
          />
          <v-list-item
            prepend-icon="mdi-cog"
            title="Paramètres"
            value="settings"
            @click="handleUserMenuClick('settings')"
          />
          <v-divider />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Déconnexion"
            value="logout"
            color="error"
            @click="logout"
          />
        </v-list>
      </v-card>
    </v-menu>
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const { mdAndUp } = useDisplay()
const drawer = ref(true)
const router = useRouter()
const showUserMenu = ref(false)
const authStore = useAuthStore()

const logout = async () => {
  await authStore.logout();
}

// User menu handlers
const handleUserMenuClick = (action: string) => {
  showUserMenu.value = false
  
  switch (action) {
    case 'profile':
      router.push('/settings/profile')
      break
    case 'settings':
      router.push('/settings')
      break
  }
}
</script>