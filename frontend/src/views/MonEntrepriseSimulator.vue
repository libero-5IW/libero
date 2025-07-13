<template>
  <div>
    <v-progress-circular v-if="loading" indeterminate color="primary" class="my-4" />
    <template v-else>
      <div v-if="getModuleName(legalStatus)" id="widget-container">
        <!-- Widget injecté ici -->
      </div>
      <template v-else>
        <v-alert type="info">
          Aucun simulateur disponible pour le statut juridique :
          <strong>
            {{
              legalStatusList.find(item => item.code === legalStatus)?.label || legalStatus
            }}
          </strong>
        </v-alert>
      </template>
      <div v-if="simulatorError" class="mt-2">
        <v-alert type="error">
          Le simulateur existe pour ce statut, mais il n'a pas pu être chargé. 
          Il se peut que le service distant soit indisponible ou qu'une extension de navigateur bloque le chargement.
        </v-alert>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { legalStatus as legalStatusList } from '@/constants/legal-status';

const userStore = useUserStore();
const legalStatus = ref('');
const loading = computed(() => userStore.loading);
const simulatorError = ref(false);

function getModuleName(status: string) {
  switch (status) {
    case 'SASU': return 'simulateur-assimilesalarie';
    case 'AE': return 'simulateur-autoentrepreneur';
    case 'EURL': return 'simulateur-eurl';
    case 'EI': return 'simulateur-EI';
    case 'EIRL': return 'simulateur-EIRL';
    default: return null;
  }
}

function removeWidgetScript() {
  const script = document.getElementById('simulateur-widget-script');
  if (script) script.remove();
}

function injectWidgetScript(status: string) {
  removeWidgetScript();
  simulatorError.value = false;
  const moduleName = getModuleName(status);
  if (!moduleName) return;

  const script = document.createElement('script');
  script.id = 'simulateur-widget-script';
  script.src = 'https://mon-entreprise.urssaf.fr/simulateur-iframe-integration.js';
  script.setAttribute('data-module', moduleName);
  script.setAttribute('data-couleur', '#284def');

  script.onerror = () => {
    simulatorError.value = true;
  };

  nextTick(() => {
    const container = document.getElementById('widget-container');
    if (container) {
      container.appendChild(script);
      setTimeout(() => {
        if (container.children.length <= 1) {
          simulatorError.value = true;
        }
      }, 4000);
    } else {
      document.body.appendChild(script);
    }
  });
}

onMounted(async () => {
  await userStore.fetchCurrentUser();
  legalStatus.value = userStore.user?.legalStatus || '';
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