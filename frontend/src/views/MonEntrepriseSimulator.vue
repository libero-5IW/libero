<template>
  <div>
    <v-progress-circular v-if="loading" indeterminate color="primary" class="my-4" />
    <template v-else>
      <div v-if="legalStatus === 'SASU'" id="widget-container">
        <!-- SASU widget will be injected here -->
        <div data-module="simulateur-assimilesalarie" data-couleur="#284def"></div>
      </div>
      <div v-else-if="legalStatus === 'Auto-entrepreneur'" id="widget-container">
        <div data-module="simulateur-autoentrepreneur" data-couleur="#284def"></div>
      </div>
      <div v-else-if="legalStatus === 'EURL'" id="widget-container">
        <div data-module="simulateur-eurl" data-couleur="#284def"></div>
      </div>
      <template v-else>
        <v-alert type="info">Aucun simulateur disponible pour votre statut juridique.</v-alert>
      </template>
      <div v-if="error" class="mt-2">
        <v-alert type="error">{{ error }}</v-alert>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import apiClient from '@/config/axios';

const legalStatus = ref('');
const loading = ref(true);
const error = ref('');

function getModuleName(status: string) {
  switch (status) {
    case 'SASU': return 'simulateur-assimilesalarie';
    case 'Auto-entrepreneur': return 'simulateur-autoentrepreneur';
    case 'EURL': return 'simulateur-eurl';
    default: return null;
  }
}

function removeWidgetScript() {
  const script = document.getElementById('simulateur-widget-script');
  if (script) script.remove();
}

function injectWidgetScript(status: string) {
  removeWidgetScript();
  const moduleName = getModuleName(status);
  if (!moduleName) return;
  const script = document.createElement('script');
  script.id = 'simulateur-widget-script';
  script.src = 'https://mon-entreprise.urssaf.fr/simulateur-iframe-integration.js';
  script.setAttribute('data-module', moduleName);
  script.setAttribute('data-couleur', '#284def');
  // Insert after nextTick to ensure the placeholder div is in the DOM
  nextTick(() => {
    const container = document.getElementById('widget-container');
    if (container) {
      container.appendChild(script);
    } else {
      document.body.appendChild(script);
    }
  });
}

onMounted(async () => {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await apiClient.get('/auth/me');
    legalStatus.value = data.legalStatus || '';
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Erreur lors de la récupération du statut juridique.';
  } finally {
    loading.value = false;
  }
});

watch(
  () => legalStatus.value,
  (newStatus) => {
    if (getModuleName(newStatus)) {
      injectWidgetScript(newStatus);
    } else {
      removeWidgetScript();
    }
  },
  { immediate: true }
);
</script>