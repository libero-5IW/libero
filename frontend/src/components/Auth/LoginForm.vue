
<template>
  <v-responsive>
    <v-container class="pa-0">
      <slot name="header"></slot>
      <v-card
          class="px-2 py-4 mx-auto"
          :subtitle="subtitle"
          max-width="600"
          elevation="0"
      >
        <template v-slot:title>
          <span class="font-weight-black">Connexion</span>
        </template>

        <v-card-text>
          <v-form
              ref="formRef"
              lazy-validation
          >
            <v-row>
              <v-col cols="12">
                <v-text-field
                    label="Email"
                    type="text"
                    v-model="form.email"
                    :rules="EmailValidationRules"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                    label="Mot de passe"
                    type="password"
                    v-model="form.password"
                    :rules="passwordValidationRules"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn :loading="loading" color="primary" block variant="flat" @click="login">Connexion</v-btn>
        </v-card-actions>
        <slot name="content.additional"></slot>
      </v-card>
    </v-container>
  </v-responsive>
</template>
  
<script setup lang="ts">
  import { computed, reactive, ref } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import {EmailRules, passwordRules} from "@/utils/validationRules.ts";
  
  const { form } = defineProps<{
    form: {
      email: string;
      password: string;
    };
  }>();

  const emit = defineEmits<{
    (e: 'error', message: string): void;
  }>();

  const authStore = useAuthStore();
  const loading = computed(() => authStore.loading);
  const hasError = computed(() => authStore.hasError);
  const errorMessage = computed(() => authStore.errorMessage);

  let subtitle = 'Entrez vos identifiants';

  const EmailValidationRules = EmailRules();
  const passwordValidationRules = passwordRules();
  const formRef = ref<any>(null);
  
  const login = async () => {
    const isFormValid = await formRef.value?.validate();
    if (!isFormValid.valid) return;

      await authStore.login(form);
      if(hasError.value) {
        emit('error', errorMessage.value);
      }
  };
</script>
  