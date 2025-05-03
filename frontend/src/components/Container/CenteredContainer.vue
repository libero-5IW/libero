<template>
  <div v-bind="$attrs" class="min-h-screen flex justify-center items-center">
    <div class="w-full max-w-screen-sm">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CenteredContainer',
});
</script>