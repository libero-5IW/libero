<template>
  <div>
    <div v-if="loading">
      <v-progress-circular indeterminate />
    </div>
    <div v-else>
      <div v-if="enabled">
        <div class="mt-2 text-green-600">2FA activé !</div>
        <v-btn color="error" class="mt-2" @click="disable2FA">Désactiver 2FA</v-btn>
      </div>
      <div v-else>
        <v-btn v-if="!qrCode" color="primary" @click="generate2FA">Activer 2FA</v-btn>
        <div v-if="qrCode" class="mt-4">
          <p>Scannez ce QR code avec Google Authenticator ou Authy :</p>
          <img :src="qrCode" alt="QR Code 2FA" />
          <v-text-field
            v-model="token"
            label="Code 2FA"
            maxlength="6"
            class="mt-4"
          />
          <v-btn color="success" class="mt-2" @click="enable2FA">Vérifier & Activer</v-btn>
        </div>
        <div v-if="error" class="mt-2 text-red-600">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '@/config/axios';

const qrCode = ref('');
const token = ref('');
const enabled = ref(false);
const error = ref('');
const loading = ref(true);

const fetch2FAStatus = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get('/auth/me');
    console.log(res);
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
    await apiClient.post('/2fa/disable');
    enabled.value = false;
    qrCode.value = '';
    token.value = '';
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la désactivation du 2FA';
  }
};
</script>
