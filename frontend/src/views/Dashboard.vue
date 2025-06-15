<template>
  <v-container fluid class="dashboard-container">
    <div class="dashboard-grid">
      <v-card class="card card-1x1">
        <v-card-title>Card 1</v-card-title>
      </v-card>

      <v-card class="card card-1x2">
        <v-card-title>Card 2</v-card-title>
      </v-card>

      <v-card class="card card-2x2">
        <v-card-title>Card 3</v-card-title>
      </v-card>

      <v-card class="card card-1x1">
        <v-card-title>Card 4</v-card-title>
      </v-card>

      <v-card class="card card-2x2">
        <v-card-title>Card 5</v-card-title>
      </v-card>

      <v-card class="card card-1x2">
        <v-card-title>Card 6</v-card-title>
      </v-card>

      <v-card class="card card-1x2">
        <v-card-title>Card 7</v-card-title>
      </v-card>
    </div>
  </v-container>
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

<style scoped>
.dashboard-container {
  height: calc(100vh - 64px); /* Subtract top nav height */
  width: calc(100vw - 256px); /* Subtract left nav width */
}

.dashboard-grid {
  display: grid;
  height: 100%;
  width: 100%;
  gap: 12px;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(0, 1fr);
  grid-auto-flow: dense;
}

/* Card base style */
.card {
  display: flex;
  flex-direction: column;
  padding: 12px;
  width: 100%;
  height: 100%;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Size modifiers (row/col spans) */
.card-1x1 {
  grid-column: span 3;
  grid-row: span 1;
}

.card-2x1 {
  grid-column: span 6;
  grid-row: span 1;
}

.card-1x2 {
  grid-column: span 3;
  grid-row: span 2;
}

.card-2x2 {
  grid-column: span 6;
  grid-row: span 2;
}

@media (max-width: 1200px) {
  .dashboard-container {
    width: calc(100vw - 200px);
  }
  
  .dashboard-grid {
    grid-template-columns: repeat(8, 1fr);
  }
  
  .card-1x1 {
    grid-column: span 2;
  }
  
  .card-2x1 {
    grid-column: span 4;
  }
  
  .card-1x2 {
    grid-column: span 2;
  }
  
  .card-2x2 {
    grid-column: span 4;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    width: 100vw;
  }
  
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .card-1x1, .card-2x1, .card-1x2, .card-2x2 {
    grid-column: span 4;
  }
}
</style>