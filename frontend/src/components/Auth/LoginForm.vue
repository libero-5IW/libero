
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
                    v-model="localForm.email"
                    :rules="EmailValidationRules"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                    label="Mot de passe"
                    type="password"
                    v-model="localForm.password"
                    :rules="passwordValidationRules"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn :loading="loading" color="primary" block variant="flat" @click="submit">Connexion</v-btn>
        </v-card-actions>
        <slot name="content.additional"></slot>
      </v-card>
    </v-container>
  </v-responsive>
</template>
  
<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import {EmailRules, passwordRules} from "@/utils/validationRules.ts";
import type { LoginData } from '@/schemas/user.schema';
  
  const props = defineProps<{
    form: {
      email: string;
      password: string;
    },   
    loading?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'submit', payload: LoginData): void;
  }>();

  let subtitle = 'Entrez vos identifiants';
  const formRef = ref<any>(null);
  const localForm = reactive({ ...props.form });

  const EmailValidationRules = EmailRules();
  const passwordValidationRules = passwordRules();

  watch(() => props.form, (newForm) => {
    Object.assign(localForm, newForm);
  });

  const submit = async () => {
    const isValid = await formRef.value?.validate();
    if (!isValid.valid) return;
    emit('submit', { ...localForm });
  };

</script>
  