<template >
  <CenteredContainer>
     <LoginForm v-if="!twoFARequired" :form="form" :loading="loading" @submit="handleLogin">
       <template v-slot:header>
         <div class="flex justify-center py-4">
           <div>
             <v-img :src="logo" width="140" aria-hidden="true"></v-img>
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
  <div v-else class="px-4 py-8 max-w-[400px] mx-auto flex flex-col items-center justify-center bg-white rounded-lg">
    <div class="w-full">
      <div class="flex justify-center mb-4">
        <v-icon color="primary" size="40">mdi-shield-key-outline</v-icon>
      </div>
      <h2 class="text-2xl font-black mb-2 text-center">Vérification en deux étapes</h2>
      <div class="mb-6 text-gray-600 text-center text-base">Veuillez entrer le code de vérification généré par votre application d'authentification.</div>
      <v-text-field
        v-model="twoFAToken"
        label="Code 2FA"
        maxlength="6"
        class="mb-4 text-center text-lg tracking-widest"
        prepend-inner-icon="mdi-lock"
        type="text"
        inputmode="numeric"
        placeholder="123456"
        hide-details="auto"
      />
      <v-btn :loading="loading" color="primary" block class="mb-2" @click="handle2FAVerify">
        Vérifier
      </v-btn>
      <div class="text-center mt-2">
        <v-btn variant="text" @click="reset2FA">Retour</v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '@/components/Auth/LoginForm.vue';
import CenteredContainer from "@/components/Container/CenteredContainer.vue";
import logo from '@/assets/logo.png';
import { onMounted, reactive, ref } from 'vue';
import { useToastHandler } from '@/composables/useToastHandler';
import { useAuthStore } from '@/stores/auth';
import { useTwoFactorStore } from '@/stores/twoFactor';
import { useUserStore } from '@/stores/user';
import type { LoginData } from '@/schemas/user.schema';
import type { ToastStatus } from '@/types';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const twoFactorStore = useTwoFactorStore();
const userStore = useUserStore();
const { showToast } = useToastHandler();
const router = useRouter();

const form = reactive({ email: '', password: '' });

const twoFARequired = ref(false);
const userId = ref('');
const twoFAToken = ref('');
const loading = ref(false);

onMounted(async () => {
  const status = history.state?.toastStatus as ToastStatus;
  const message = history.state?.toastMessage as string;

  if (message && status) {
    showToast(status, message);
  }
});

const handleLogin = async (form: LoginData) => {
  try {
    loading.value = true;
    const res: any = await authStore.login(form);
    if (res?.twoFactorRequired) {
      twoFARequired.value = true;
      userId.value = res?.userId;
    } else if (res?.token) {
      localStorage.setItem('token', res.token);
      await userStore.fetchCurrentUser();
      router.push('/dashboard');
    }
  } finally {
    loading.value = false;
  }
};


const handle2FAVerify = async () => {
  try {
    loading.value = true;
    const token = await twoFactorStore.twoFAVerify(userId.value, twoFAToken.value);
    localStorage.setItem('token', token);
    await userStore.fetchCurrentUser();
    authStore.isAuthenticated = true;
    router.push('/dashboard');
  } finally {
    loading.value = false;
  }
};

const reset2FA = () => {
  twoFARequired.value = false;
  userId.value = '';
  twoFAToken.value = '';
};
</script>