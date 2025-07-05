<template>
  <CenteredContainer>
    <div class="shadow-lg shadow-gray-300 border">
      <LoginForm
        v-if="!twoFARequired"
        :form="form"
        :loading="loading"
        @submit="handleLogin"
      >
        <template v-slot:header>
          <div class="flex justify-center py-4">
            <div>
              <v-img :src="logo" width="100"></v-img>
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
            <router-link to="/EmailResetPassword">Réinitialiser</router-link>
          </div>
        </template>
      </LoginForm>
      <div v-else class="p-6 flex flex-col items-center justify-center bg-gray-100 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4 text-center">Vérification en deux étapes</h2>
        <v-icon color="primary" size="36" class="mb-2">mdi-shield-key-outline</v-icon>
        <div class="mb-2 text-gray-600 text-center">Veuillez entrer le code de vérification généré par votre application d'authentification.</div>
        <v-text-field
          v-model="twoFAToken"
          label="Code 2FA"
          maxlength="6"
          class="mb-4 min-w-[300px] text-center text-lg tracking-widest"
          prepend-inner-icon="mdi-lock"
          type="text"
          inputmode="numeric"
          placeholder="123456"
          hide-details="auto"
        />
        <v-btn :loading="loading" color="primary" block class="min-w-[300px]" @click="handle2FAVerify">
          Vérifier
        </v-btn>
        <div class="text-center mt-4">
          <v-btn variant="text" @click="reset2FA">Retour</v-btn>
        </div>
      </div>
    </div>
  </CenteredContainer>
</template>

<script setup lang="ts">
import LoginForm from '@/components/Auth/LoginForm.vue';
import CenteredContainer from "@/components/Container/CenteredContainer.vue";
import logo from '@/assets/logo.png';
import { computed, onMounted, reactive, ref } from 'vue';
import { useToastHandler } from '@/composables/useToastHandler';
import { useAuthStore } from '@/stores/auth';
import type { LoginData } from '@/schemas/user.schema';
import type { ToastStatus } from '@/types';
import axios from 'axios';
import apiClient from '@/config/axios';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const { showToast } = useToastHandler();
const router = useRouter();

const form = reactive({ email: '', password: '' });
const loading = computed(() => authStore.loading);

const twoFARequired = ref(false);
const userId = ref('');
const twoFAToken = ref('');

onMounted(async () => {
  const status = history.state?.toastStatus as ToastStatus;
  const message = history.state?.toastMessage as string;

  if (message && status) {
    showToast(status, message);
  }
});

const handleLogin = async (form: LoginData) => {
  try {
    const res = await apiClient.post('/auth/login', form);
    if (res.data.twoFactorRequired) {
      twoFARequired.value = true;
      userId.value = res.data.userId;
    } else {
      // handle normal login (store JWT, redirect, etc.)
      await authStore.login(form);
    }
  } catch (err: any) {
    showToast('error', err.response?.data?.message || 'Erreur de connexion');
  }
};

const handle2FAVerify = async () => {
  try {
    const res = await apiClient.post('/auth/2fa/verify', {
      userId: userId.value,
      token: twoFAToken.value,
    });
    // 1. Store the token
    const token = res.data.token;
    localStorage.setItem('token', token);

    // 2. Fetch user info
    const me = await apiClient.get('/auth/me');
    authStore.user = me.data;
    authStore.isAuthenticated = true;

    // 3. Redirect
    router.push('/dashboard');
  } catch (err: any) {
    showToast('error', err.response?.data?.message || 'Code 2FA invalide');
  }
};

const reset2FA = () => {
  twoFARequired.value = false;
  userId.value = '';
  twoFAToken.value = '';
};
</script>
