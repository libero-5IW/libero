<template>
  <CenteredContainer>
    <div class="shadow-lg shadow-gray-300 border">
      <LoginForm :form="form" @error="handleLoginError">
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
    </div>
  </CenteredContainer>
</template>

<script setup lang="ts">
  import LoginForm from '@/components/Auth/LoginForm.vue';
  import CenteredContainer from "@/components/Container/CenteredContainer.vue";
  import logo from '@/assets/logo.png';

  import { reactive } from 'vue';
  import { useToastHandler } from '@/composables/useToastHandler';

  const { showToast } = useToastHandler(); 
  const form = reactive({
    email: '',
    password: ''
  });

  const handleLoginError = (message: string) => {
    showToast('error', message);
  };

</script>
