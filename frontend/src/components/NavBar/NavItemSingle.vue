<template>
  <v-list-item
    :to="to"
    :value="to"
    :active="isActive"
    :class="{
      'bg-primary': isActive
    }"
  >
    <template v-slot:prepend>
      <v-icon
        :icon="icon"
        :class="isActive ? 'text-surface' : 'text-primary'"
      />
    </template>
    <v-list-item-title :class="isActive ? 'text-surface' : 'text-primary'">
      {{ title }}
    </v-list-item-title>
  </v-list-item>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
import { useRoute } from 'vue-router'

  const route = useRoute()

  const props = defineProps<{
    title: string
    to: string
    icon: string
  }>()

  const isActive = computed(() =>
  route.path === props.to
)
</script>
