<template>
  <div>
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
      <v-btn v-if="enabled" color="error" class="mt-2" @click="disable2FA">Désactiver 2FA</v-btn>
      <div v-if="enabled" class="mt-2 text-green-600">2FA activé !</div>
      <div v-if="error" class="mt-2 text-red-600">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import apiClient from '@/config/axios';

const qrCode = ref('');
const token = ref('');
const enabled = ref(false);
const error = ref('');

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
