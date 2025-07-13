<template>
  <v-card class="pa-6">
    <v-card-title class="text-primary">
      Changer mon mot de passe
    </v-card-title>

    <div class="text-body-2 text-medium-emphasis px-4 mb-2">
      Choisissez un mot de passe sécurisé pour protéger votre compte.
    </div>

    <v-divider class="mb-6" />

    <v-form ref="formRef" @submit.prevent="submit" lazy-validation>
      <v-row dense>
        <v-col cols="12">
          <v-text-field
            v-model="form.currentPassword"
            label="Mot de passe actuel"
            type="password"
            required
            :rules="requiredRuleList"
            aria-label="Champ mot de passe actuel"
          />
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="form.newPassword"
            label="Nouveau mot de passe"
            type="password"
            required
            :rules="passwordValidationRules"
            aria-label="Champ nouveau mot de passe"
          />
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="form.confirmPassword"
            label="Confirmer le mot de passe"
            type="password"
            required
            :rules="passwordMatchValidationRules"
            aria-label="Champ confirmation mot de passe"
          />
        </v-col>
      </v-row>

      <v-card-actions class="justify-end mt-4">
        <v-btn 
          :loading="loading"
          :aria-busy="loading ? 'true' : 'false'"
          aria-label="Enregistrer le nouveau mot de passe"
          color="primary" 
          class="px-4 py-2"
          variant="flat"
          type="submit"
        >
          Enregistrer
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { passwordMatchRule, passwordRules, requiredRule } from '@/utils/validationRules.ts'
import { useUserStore } from '@/stores/user'
import router from '@/routes';

const userStore = useUserStore()

const loading = computed(() => userStore.loading)
const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const formRef = ref()

const requiredRuleList = [requiredRule('Champ requis')]
const passwordValidationRules = passwordRules()
const passwordMatchValidationRules = computed(() => passwordMatchRule(form.value.newPassword))

const submit = async () => {
  const isValid = await formRef.value?.validate()
  if (!isValid) return

  await userStore.changePassword({
    currentPassword: form.value.currentPassword,
    newPassword: form.value.newPassword
  })

  form.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
  formRef.value.resetValidation()
  
  router.push({
      path: '/settings/profile',
      state: { toastStatus : 'success', toastMessage: 'Le mot de passe a bien été changé !' }
  });
}
</script>
