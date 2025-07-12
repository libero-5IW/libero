<template>
  <v-list-item
    :to="to"
    :value="to"
    :active="route.path === to"
    :class="{
      'bg-[rgba(var(--v-theme-text-secondary-light),_0.12)]': route.path === to
    }"
  >
    <template v-slot:prepend>
      <v-icon
        :icon="icon"
        :class="route.path === to ? 'text-primary' : 'text-secondary'"
      />
    </template>
    <v-list-item-title class="text-primary">
      {{ title }}
    </v-list-item-title>
  </v-list-item>
</template>

<script setup lang="ts">
  import { useRoute } from 'vue-router'

  const route = useRoute()

  defineProps<{
    title: string
    to: string
    icon: string
  }>()
</script>
