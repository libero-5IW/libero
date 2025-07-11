import MonEntrepriseSimulator from '@/views/MonEntrepriseSimulator.vue';
import type { RouteRecordRaw } from 'vue-router';

const apiRoutes: RouteRecordRaw[] = [
    {
        path: '/simulateur',
        component: MonEntrepriseSimulator
      }
];

export default apiRoutes; 