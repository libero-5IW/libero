<template>
  <v-card class="pa-4 elevation-0 twofa-card">
    <div v-if="loading" class="d-flex justify-center my-8">
      <v-progress-circular indeterminate color="primary" size="40" />
    </div>
    <div v-else>
      <div v-if="enabled">
        <v-alert type="success" class="mb-4" border="start" color="success" variant="tonal">
          2FA est activé sur votre compte.
        </v-alert>
        <div v-if="!showPasswordField">
          <v-btn color="error" variant="flat" class="mt-2" @click="showPasswordField = true">
            <v-icon start>mdi-lock-off</v-icon>
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
          <div class="d-flex gap-2 mt-2">
            <v-btn color="error" variant="flat" @click="disable2FA">
              <v-icon start>mdi-check</v-icon>
              Valider
            </v-btn>
            <v-btn variant="text" @click="cancelDisable">
              Annuler
            </v-btn>
          </div>
        </div>
        <v-alert v-if="error" type="error" class="mt-4" border="start" color="error" variant="tonal">
          <v-icon start>mdi-alert-circle</v-icon>
          {{ error }}
        </v-alert>
      </div>
      <div v-else>
        <v-btn v-if="!qrCode" color="primary" variant="flat" @click="generate2FA">
          <v-icon start>mdi-shield-key</v-icon>
          Activer 2FA
        </v-btn>
        <v-card v-if="qrCode" class="pa-4 mt-4 twofa-qr-card" outlined>
          <div class="text-center mb-2">
            <p class="mb-2">Scannez ce QR code avec Google Authenticator ou Authy :</p>
            <img :src="qrCode" alt="QR Code 2FA" class="mx-auto" style="max-width: 180px;" />
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
        </v-card>
        <v-alert v-if="error" type="error" class="mt-4" border="start" color="error" variant="tonal">
          <v-icon start>mdi-alert-circle</v-icon>
          {{ error }}
        </v-alert>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '@/config/axios';

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
    const res = await apiClient.get('/auth/me');
    enabled.value = !!res.data.isTwoFactorEnabled;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la récupération du statut 2FA';
  } finally {
    loading.value = false;
  }
};

onMounted(fetch2FAStatus);

const generate2FA = async () => {
  error.value = '';
  try {
    const res = await apiClient.post('/2fa/generate');
    qrCode.value = res.data.qrCode;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la génération du QR code';
  }
};

const enable2FA = async () => {
  error.value = '';
  try {
    const res = await apiClient.post('/2fa/enable', { token: token.value });
    if (res.data.valid) {
      enabled.value = true;
      qrCode.value = '';
      token.value = '';
    } else {
      error.value = 'Code 2FA invalide';
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de l’activation du 2FA';
  }
};

const disable2FA = async () => {
  error.value = '';
  try {
    await apiClient.post('/2fa/disable', { password: password.value });
    enabled.value = false;
    qrCode.value = '';
    token.value = '';
    password.value = '';
    showPasswordField.value = false;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la désactivation du 2FA';
  }
};

const cancelDisable = () => {
  showPasswordField.value = false;
  password.value = '';
  error.value = '';
};
</script>

<style scoped>
.twofa-card {
  background: #f8fafc;
  border-radius: 12px;
}
.twofa-qr-card {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e3e7ed;
}
</style>
