<template>
  <v-list-item
    :to="to"
    :value="title"
    class="mx-1 my-2"
    :active="$route.path === to"
    :class="{
      'custom-active-bg': $route.path === to
    }"
  >
    <template v-slot:prepend>
      <v-icon
        :icon="icon"
        :class="$route.path === to ? 'text-primary' : 'text-text-secondary'"
      />
    </template>
    <v-list-item-title :class="{
      'text-primary': $route.path === to,
      'text-text-secondary': $route.path !== to
    }">{{ title }}</v-list-item-title>
  </v-list-item>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  to: string
  icon: string
}>()
</script>

<style scoped>
.custom-active-bg {
  background-color: rgba(var(--v-theme-text-secondary-light), 0.12) !important;
}

:deep(.v-list-item--active) {
  background: none;
}

:deep(.v-list-item) {
  background: none;
}
</style>