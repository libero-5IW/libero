<template>
  <v-responsive>
    <v-container class="pa-0">
    <slot name="header"></slot>
      <v-card class="px-2" :subtitle="subtitle" py-4 mx-auto max-width="700" elevation="0">
        <template v-slot:title>
          <span class="font-weight-black">Inscription</span>
        </template>

        <v-card-text>
          <v-form ref="formRef" lazy-validation>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Prénom"
                  v-model="form.firstName"
                  :rules="firstNameRules()"
                  :error-messages="formErrors.firstName"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Nom"
                  v-model="form.lastName"
                  :rules="lastNameRules()"
                  :error-messages="formErrors.lastName"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Email"
                  v-model="form.email"
                  :rules="emailRules()"
                  :error-messages="formErrors.email"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Adresse"
                  v-model="form.addressLine"
                  :rules="addressLineRules()"
                  :error-messages="formErrors.addressLine"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Code postal"
                  v-model="form.postalCode"
                  :rules="postalCodeRules()"
                  :error-messages="formErrors.postalCode"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Ville"
                  v-model="form.city"
                  :rules="cityRules()"
                  :error-messages="formErrors.city"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                v-model="form.country"
                :rules="countryRules()"
                :items="countryList"
                item-title="name"
                item-value="name"
                label="Pays"
                required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                v-model="form.legalStatus"
                :rules="legalStatusSelectRules()"
                :items="legalStatus"
                item-title="label"
                item-value="label"
                label="Statut juridique"
                required
                />
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field
                v-if="form.legalStatus === 'Autre'"
                v-model="form.customLegalStatus"
                label="Précisez votre statut juridique"
                required
                :rules="legalStatusRules()"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Numéro de SIRET"
                  v-model="form.siret"
                  :rules="siretRules()"
                  :error-messages="formErrors.siret"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="TVA intracom (optionnel)"
                  v-model="form.tvaNumber"
                  :rules="tvaNumberRules()"
                  :error-messages="formErrors.tvaNumber"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Nom de l'entreprise (optionnel)"
                  v-model="form.companyName"
                  :rules="companyNameRules()"
                  :error-messages="formErrors.companyName"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Mot de passe"
                  v-model="form.password"
                  :rules="passwordRulesZod()"
                  :type="'password'"
                  :error-messages="formErrors.password"
                  required
                />
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field
                label="Confirmer le mot de passe"
                type="password"
                v-model="form.confirmPassword"
                :rules="passwordMatchValidationRules"
                required
                />
              </v-col>
              <v-col
                v-for="(rules, index) in [passwordRulesList.slice(0, 3), passwordRulesList.slice(3, 5)]"
                :key="index"
                cols="6"
                class="d-flex justify-center"
                >
                <v-list dense>
                    <v-list-item
                    v-for="rule in rules"
                    :key="rule.text"
                    class="d-flex align-center ma-0 pa-0 text-[0.85rem] text-[#4a4a4a] leading-[1.1]"
                    >
                    <v-icon :color="rule.valid ? 'green' : 'red'" class="mr-2">
                        {{ rule.valid ? 'mdi-check-circle' : 'mdi-close-circle' }}
                    </v-icon>
                    <span>{{ rule.text }}</span>
                    </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn :loading="loading" color="primary" block variant="flat" @click="submit">
            Valider
          </v-btn>
        </v-card-actions>
        <div class="px-4 py-4">
            <slot name="content.additional"></slot>
        </div>
      </v-card>
    </v-container>
  </v-responsive>
</template>

<script setup lang="ts">
    import { ref, computed, watch } from 'vue'
    import { RegisterDataSchema, type RegisterData } from '@/schemas/user.schema'
    import { countryList } from '@/utils/countries'
    import {passwordMatchRule} from "@/utils/validationRules.ts"
    import { legalStatus } from '@/constants/legal-status'
    import { 
        passwordRulesZod, 
        addressLineRules, 
        cityRules, 
        companyNameRules, 
        countryRules, 
        emailRules, 
        firstNameRules, 
        lastNameRules, 
        legalStatusRules, 
        postalCodeRules, 
        siretRules, 
        legalStatusSelectRules,
        tvaNumberRules } from '@/utils/registrationValidationRules'

    
    type RegisterFormWithConfirm = RegisterData & { confirmPassword: string, customLegalStatus: string };

    const props = defineProps<{
      data: RegisterData;
      loading?: boolean;
    }>();

    const emit = defineEmits<{
      (e: 'submit', payload: RegisterData): void;
      (e: 'error', message: string): void;
    }>();

    const form = ref<RegisterFormWithConfirm>({
      ...props.data,
      confirmPassword: '',
      customLegalStatus: ''
    });
    const formRef = ref<any>(null);
    const formErrors = ref<Record<string, string>>({});

    const passwordRulesList = computed(() => [
    { text: 'Au moins 12 caractères', valid: form.value.password.length >= 12 },
    { text: 'Contient une lettre majuscule', valid: /[A-Z]/.test(form.value.password) },
    { text: 'Contient une lettre minuscule', valid: /[a-z]/.test(form.value.password) },
    { text: 'Contient un chiffre', valid: /[0-9]/.test(form.value.password) },
    { text: 'Contient un caractère spécial', valid: /[^A-Za-z0-9]/.test(form.value.password) },
    ]);

    let subtitle = 'Entrez vos informations pour vous inscrire.';
    const passwordMatchValidationRules = computed(() => passwordMatchRule(form.value.password));

    watch(() => props.data, (newVal) => {
      Object.assign(form.value, newVal);
    });

    const validateForm = () => {
      const result = RegisterDataSchema.safeParse(form.value);
      formErrors.value = {};

      if (!result.success) {
        result.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          formErrors.value[field] = err.message;
        });
        return false;
      }

      if (form.value.legalStatus === 'Autre' && !form.value.customLegalStatus.trim()) {
        formErrors.value.customLegalStatus = 'Veuillez préciser votre statut juridique.';
        return false;
      }

      return true;
    }

    const submit = async () => {
      const isFormValid = await formRef.value?.validate();
      if (!isFormValid) return;
      if (!validateForm()) return;
      const { confirmPassword, customLegalStatus, ...rest } = form.value;

      const payload: RegisterData = {
        ...rest,
        legalStatus:
          form.value.legalStatus === 'Autre'
            ? form.value.customLegalStatus.trim()
            : form.value.legalStatus,
      };

      emit('submit', payload);
    }

    const clearErrorOnValidInput = <T extends keyof RegisterFormWithConfirm>(
      field: T,
      rules: ((v: any) => boolean | string)[]
    ) => {
      watch(() => form.value[field], (newVal) => {
        if (!formErrors.value[field]) return;

        const isValid = rules.every(rule => rule(newVal) === true);
        if (isValid) delete formErrors.value[field];
      });
    }

    clearErrorOnValidInput('siret', siretRules());
    clearErrorOnValidInput('email', emailRules());
    clearErrorOnValidInput('firstName', firstNameRules());
    clearErrorOnValidInput('lastName', lastNameRules());
    clearErrorOnValidInput('addressLine', addressLineRules());
    clearErrorOnValidInput('postalCode', postalCodeRules());
    clearErrorOnValidInput('city', cityRules());
    clearErrorOnValidInput('legalStatus', legalStatusSelectRules());
    clearErrorOnValidInput('password', passwordRulesZod());
    clearErrorOnValidInput('customLegalStatus', legalStatusRules());
</script>

