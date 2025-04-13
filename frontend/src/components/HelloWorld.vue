<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div>
    <h1>{{ msg }}</h1>
    <p>
      You’ve successfully created a project with
    </p>

            <v-icon color="black">mdi-account-outline</v-icon>
  </div>
</template>