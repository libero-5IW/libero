<template>
  <div class="max-w-4xl mx-auto mt-8">
    <div class="flex justify-center mb-6">
      <div class="bg-white border rounded-t-lg px-8 py-3 shadow flex items-center space-x-4">
        <template v-for="(item, index) in tabs" :key="item.name">
          <router-link
            :to="item.route"
            class="text-sm font-medium transition-colors"
            :class="isActive(item.route) ? 'text-primary font-weight-medium' : 'text-gray-400'"
          >
            {{ item.label }}
          </router-link>

          <div
            v-if="index < tabs.length - 1"
            class="h-4 border-r mx-2 border-gray-300"
          ></div>
        </template>
      </div>
    </div>

    <!-- Contenu -->
    <div>
      <v-container class="py-8">
        <v-row justify="center">
          <v-col cols="12" md="8" lg="9">
            <router-view />
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { name: 'profile', label: 'Profil', route: '/settings/profile' },
  { name: 'security', label: 'Sécurité', route: '/settings/security' },
  { name: 'password', label: 'Changer le mot de passe', route: '/settings/password' },
]

const isActive = (path: string) => route.path === path
</script>
