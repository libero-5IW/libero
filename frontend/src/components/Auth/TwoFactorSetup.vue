<template>
  <div class="rounded-xl p-6">
    <div v-if="loading" class="flex justify-center my-8">
      <v-progress-circular indeterminate color="primary" size="40" />
    </div>
    <div v-else>
      <div v-if="enabled">
        <v-alert type="success" class="mb-4" border="start" color="success" variant="tonal">
          2FA est activé sur votre compte.
        </v-alert>
        <div v-if="!showPasswordField">
          <v-btn color="error" variant="flat" class="mt-2" @click="showPasswordField = true">
            Désactiver 2FA
          </v-btn>
        </div>
        <div v-else>
          <v-text-field
            v-model="password"
            label="Mot de passe"
            type="password"
            class="mt-2"
            prepend-inner-icon="mdi-lock"
            autocomplete="current-password"
          />
          <div class="flex gap-2 mt-2">
            <v-btn color="primary" variant="flat" @click="disable2FA">
              <v-icon start>mdi-check</v-icon>
              Valider
            </v-btn>
            <v-btn variant="text" @click="cancelDisable">
              Annuler
            </v-btn>
          </div>
        </div>
        <v-alert v-if="error" type="error" class="mt-4" border="start" color="error" variant="tonal">
          {{ error }}
        </v-alert>
      </div>
      <div v-else>
        <v-btn v-if="!qrCode" color="primary" variant="flat" @click="generate2FA">
          <v-icon start>mdi-shield-key</v-icon>
          Activer 2FA
        </v-btn>
        <div v-if="qrCode" class="bg-white rounded-lg border border-slate-200 p-6 mt-4">
          <div class="text-center mb-2">
            <p class="mb-2">Scannez ce QR code avec Google Authenticator ou Authy :</p>
            <img :src="qrCode" alt="QR Code 2FA" class="mx-auto max-w-[180px]" />
          </div>
          <v-text-field
            v-model="token"
            label="Code 2FA"
            maxlength="6"
            class="mt-2"
            prepend-inner-icon="mdi-shield-key-outline"
            autocomplete="one-time-code"
          />
          <v-btn color="success" variant="flat" class="mt-2" @click="enable2FA">
            <v-icon start>mdi-check</v-icon>
            Vérifier & Activer
          </v-btn>
        </div>
        <v-alert v-if="error" type="error" class="mt-4" border="start" color="error" variant="tonal">
          {{ error }}
        </v-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { useTwoFactorStore } from '@/stores/twoFactor';

const userStore = useUserStore();
const twoFactorStore = useTwoFactorStore();
const qrCode = ref('');
const token = ref('');
const enabled = ref(false);
const error = ref('');
const loading = ref(true);
const password = ref('');
const showPasswordField = ref(false);

const fetch2FAStatus = async () => {
  loading.value = true;
  try {
    enabled.value = await userStore.fetch2FAStatus();
  } catch (err: any) {
    error.value = err;
  } finally {
    loading.value = false;
  }
};

onMounted(fetch2FAStatus);

const generate2FA = async () => {
  error.value = '';
  try {
    qrCode.value = await twoFactorStore.generate2FA();
  } catch (err: any) {
    error.value = err;
  }
};

const enable2FA = async () => {
  error.value = '';
  try {
    const valid = await twoFactorStore.enable2FA(token.value);
    if (valid) {
      await fetch2FAStatus();
      qrCode.value = '';
      token.value = '';
    } else {
      error.value = 'Code 2FA invalide';
    }
  } catch (err: any) {
    error.value = err;
  }
};

const disable2FA = async () => {
  error.value = '';
  try {
    await twoFactorStore.disable2FA(password.value);
    await fetch2FAStatus();
    qrCode.value = '';
    token.value = '';
    password.value = '';
    showPasswordField.value = false;
  } catch (err: any) {
    error.value = err;
  }
};

const cancelDisable = () => {
  showPasswordField.value = false;
  password.value = '';
  error.value = '';
};
</script>