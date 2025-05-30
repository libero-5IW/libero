<template>
  <div class="m-6">
    <HelloWorld msg="coucouuuu" />
    <div v-if="user" class="bg-custom-primary">
      <h1>{{ user.firstName }} {{ user.lastName }}</h1>
      <p>Email: {{ user.email }}</p>
      <p>Société: {{ user.companyName }}</p>
    </div>
    <v-btn @click="logout">
      deconnexion
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import HelloWorld from '@/components/HelloWorld.vue';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { computed, onMounted } from 'vue';

const userStore = useUserStore()
const authStore = useAuthStore()
const user = computed(() => userStore.user)

onMounted(() => {
  userStore.fetchCurrentUser()
})

const logout = async () => {
  await authStore.logout();
}
</script>
