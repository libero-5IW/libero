<template>
  <CenteredContainer>
    <v-container class="pa-0">
      <div class="flex justify-center py-4">
        <div>
          <v-img :src="logo" width="140" />
        </div>
      </div>
      
      <template  v-if="!loadingToken">

      <v-card class="px-2 py-4 mx-auto" max-width="600" elevation="0">
          
          <div v-if="!tokenValid">
            <v-card-title>
              <span class="font-weight-black">Lien expiré</span>
            </v-card-title>
            <v-card-text>
              <p class="text-error text-lg">
                Le lien de réinitialisation est invalide ou expiré.
              </p>

            </v-card-text>
              <div class="text-center pt-4 pb-4">
                <p class="text-gray-600">Mémoire retrouvée&nbsp?</p>
                <router-link to="/login">Se connecter</router-link>

                <p class="text-gray-600">Le lien ne fonctionne plus&nbsp?</p>
                <router-link to="/email-reset-password">Demander un nouveau lien</router-link>
              </div>
          </div>

          <div v-else>
            <v-card-title>
              <span class="font-weight-black">Nouveau mot de passe</span>
            </v-card-title>

            <v-card-subtitle class="text-gray-600">
              Choisissez un nouveau mot de passe sécurisé.
            </v-card-subtitle>
            
            <v-card-text>
              <v-form  ref="formRef" lazy-validation>
                <v-text-field
                label="Nouveau mot de passe"
                type="password"
                v-model="password"
                :rules="passwordRules()"
                required
                class="pb-2"
                />
                <v-text-field
                label="Confirmer le mot de passe"
                type="password"
                v-model="confirmPassword"
                :rules="[v => v === password || 'Les mots de passe ne correspondent pas']"
                required
                />
                <p class="text-sm text-gray-600 mt-1">
                  Le mot de passe doit contenir au moins <strong>12 caractères</strong>, avec une <strong>majuscule</strong>, une <strong>minuscule</strong>, un <strong>chiffre</strong> et un <strong>symbole</strong>.
                </p>
              </v-form>
            </v-card-text>
            
            <v-card-actions>
              <v-btn :loading="loading" color="primary" block variant="flat" @click="submit">
                Réinitialiser
              </v-btn>
            </v-card-actions>
            
            <div class="text-center">
              <p class="text-gray-600">Mémoire retrouvée&nbsp?</p>
              <router-link to="/login">Se connecter</router-link>
            </div>
          </div>
        </v-card>

      </template>

    </v-container>
  </CenteredContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import CenteredContainer from '@/components/Container/CenteredContainer.vue';
import { useAuthStore } from '@/stores/auth';
import { passwordRules } from '@/utils/validationRules';
import { useRoute, useRouter } from 'vue-router';
import logo from '@/assets/logo.png';

const route = useRoute();
const router = useRouter();

const token = route.query.token as string;
const tokenValid = ref(false);
const loadingToken = ref(true);

const password = ref('');
const confirmPassword = ref('');
const formRef = ref();
const authStore = useAuthStore();
const loading = computed(() => authStore.loading);


onMounted(async () => {
  if (!token) {
    tokenValid.value = false;
    loadingToken.value = false;
    return;
  }
  
  await authStore.checkResetToken(token);
  tokenValid.value = true;
  loadingToken.value = false;
});

const submit = async () => {
  const valid = await formRef.value?.validate();
  if (!valid?.valid) return;

  await authStore.resetPassword(token, password.value);
  router.push({
    path: '/login',
    state: { toastStatus : 'success', toastMessage: 'Mot de passe réinitialisé avec succès, connectez-vous !' }
  });
};
</script>
