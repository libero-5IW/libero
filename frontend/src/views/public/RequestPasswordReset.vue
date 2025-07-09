<template>
  <CenteredContainer>
    <v-container class="pa-0">
        <div class="flex justify-center py-4">
          <div>
            <v-img :src="logo" width="140"></v-img>
          </div>
        </div>

      <v-card
        class="px-2 py-4 mx-auto"
        max-width="600"
        elevation="0"
        :subtitle="subtitle"
      >
        <template v-slot:title>
          <span class="font-weight-black">Mot de passe oublié</span>
        </template>

        <v-card-text>
          <v-form ref="formRef" lazy-validation>
            <v-text-field
              label="Email"
              type="email"
              v-model="email"
              :rules="emailRules"
              required
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn :loading="loading" color="primary" block variant="flat" @click="submit">
            Envoyer le lien
          </v-btn>
        </v-card-actions>

        <div class="text-center">
          <p class="text-gray-600">Plus de trous de mémoire ?</p>
          <router-link to="/login">Se connecter</router-link>
        </div>
      </v-card>
    </v-container>
  </CenteredContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import CenteredContainer from '@/components/Container/CenteredContainer.vue';
import { useAuthStore } from '@/stores/auth';
import { useToastHandler } from '@/composables/useToastHandler';
import { EmailRules } from '@/utils/validationRules';
import { useRouter } from 'vue-router';
import logo from '@/assets/logo.png';

const email = ref('');
const emailRules = EmailRules();
const formRef = ref();
const authStore = useAuthStore();
const router = useRouter();
const loading = computed(() => authStore.loading);
const subtitle = 'Entrez votre adresse email pour recevoir un lien de réinitialisation.';

const submit = async () => {
  const valid = await formRef.value?.validate();
  if (!valid?.valid) return;

  const success = await authStore.sendResetPasswordEmail(email.value);
  if (success) {
    router.push({
      path: '/login',
      state: { toastStatus : 'success', toastMessage: 'Si un compte existe avec cette adresse e-mail, un lien de réinitialisation vous a été envoyé.' }
    });
  }

};
</script>
