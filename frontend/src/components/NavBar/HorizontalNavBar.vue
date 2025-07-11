<template>
  <v-app-bar
    :style="{ background: theme.current.value.colors.appbar }"
    color="appbar"
    class="border-l border-black/10"
    elevation="0"
    height="64"
  >
    <v-spacer />

        <!-- Help button with tooltip -->
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

    <!-- User profile dropdown -->
    <v-menu
      v-model="showUserMenu"
      location="bottom end"
      offset="5"
    >
      <template v-slot:activator="{ props }">
        <v-btn 
          icon 
          v-bind="props"
          :class="lgAndUp ? 'mr-4' : 'mr-2'"
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import { useTheme } from 'vuetify'

const theme = useTheme()
const router = useRouter()
const { lgAndUp } = useDisplay()
const showNotifications = ref(false)
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
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
  }
}
</script>
