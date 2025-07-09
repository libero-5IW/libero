<template>
  <CenteredContainer>
    <LoginForm :form="form" :loading="loading" @submit="handleLogin">
      <template v-slot:header>
        <div class="flex justify-center py-4">
          <div>
            <v-img :src="logo" width="140" alt="Logo de l'application" />
          </div>
        </div>
      </template>

      <template v-slot:content.additional>
        <div class="text-center">
          <p class="text-gray-600">Pas encore de compte ?</p>
          <router-link to="/register">S'inscrire</router-link>
        </div>
        <div class="text-center">
          <p class="text-gray-600">Mot de passe oublié ?</p>
          <router-link to="/email-reset-password">Réinitialiser</router-link>
        </div>
      </template>
    </LoginForm>
  </CenteredContainer>
</template>

<script setup lang="ts">
  import LoginForm from '@/components/Auth/LoginForm.vue';
  import CenteredContainer from '@/components/Container/CenteredContainer.vue';
  import logo from '@/assets/logo.png';
  import { computed, onMounted, reactive } from 'vue';
  import { useToastHandler } from '@/composables/useToastHandler';
  import { useAuthStore } from '@/stores/auth';
  import type { LoginData } from '@/schemas/user.schema';
  import type { ToastStatus } from '@/types';

  const authStore = useAuthStore();
  const { showToast } = useToastHandler();

  const form = reactive({ email: '', password: '' });
  const loading = computed(() => authStore.loading);

  onMounted(async () => {
    const status = history.state?.toastStatus as ToastStatus;
    const message = history.state?.toastMessage as string;

    if (message && status) {
      showToast(status, message);
    }
  });

  const handleLogin = async (form: LoginData) => {
    await authStore.login(form);
  };
</script>
