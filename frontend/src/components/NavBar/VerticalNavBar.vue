<template>
  <v-navigation-drawer
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :permanent="permanent"
    location="left"
    width="250"
  >
    <div class="pa-4">
      <img src="@/assets/logo.png" alt="Logo" class="w-1/3 h-auto mx-auto" />
    </div>

    <v-list>
      <NavGroupAccordian />
      <NavItemSingle title="Page" to="#" icon="mdi-view-dashboard" />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import NavGroupAccordian from './NavGroupAccordian.vue'
import NavItemSingle from './NavItemSingle.vue'

defineProps<{
  modelValue?: boolean
  permanent?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped>
/* Add smooth transition for drawer */
:deep(.v-navigation-drawer) {
  transition: transform 0.25s ease-in-out !important;
}
</style>
