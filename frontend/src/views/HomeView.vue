<template>
  <main>
    <HelloWorld msg="coucouuuu" />
    <v-list>
      <v-list-item v-for="user in users" :key="user.id">
        <v-list-item-content>
          <v-list-item-title>{{ user.firstName }} {{ user.lastName }}</v-list-item-title>
          <v-list-item-subtitle>Email: {{ user.email }}</v-list-item-subtitle>
          <v-list-item-subtitle>Société: {{ user.companyName }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </main>
</template>

<script setup lang="ts">
  import HelloWorld from '@/components/HelloWorld.vue';
  import { useUserStore } from '@/stores/user';
  import { computed, defineComponent, onMounted } from 'vue';

  const userStore = useUserStore()

  onMounted(() => {
    userStore.fetchUsers()
  })

const users = computed(() => userStore.users)
</script>
