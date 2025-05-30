<script setup lang="ts">
import { ref } from 'vue'
// import { useTheme } from 'vuetify'

const drawer = ref(true)
// const theme = useTheme()

// function toggleTheme () {
//   theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
// }
</script>

<template>
      <v-container>
        <v-navigation-drawer app v-model="drawer" permanent>
          <v-list-item title="My Application" subtitle="Vuetify"></v-list-item>
          <v-divider></v-divider>
          <v-list-item link title="List Item 1" class="bg-primary"></v-list-item>
          <v-list-item link title="List Item 2"></v-list-item>
          <v-list-item link title="List Item 3"></v-list-item>
          <!-- <v-btn @click="toggleTheme">toggle theme</v-btn> -->

        </v-navigation-drawer>
      </v-container>
  </template>