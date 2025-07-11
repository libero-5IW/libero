import type { RouteRecordRaw } from 'vue-router';

const legalRoutes: RouteRecordRaw[] = [
  {
    path: '/legal',
    component: () => import('@/views/Legal.vue'),
  },
  {
    path: '/legal/cgu',
    component: () => import('@/views/legal/CGU.vue'),
  },
  {
    path: '/legal/mentions-legales',
    component: () => import('@/views/legal/MentionsLegales.vue'),
  },
  {
    path: '/legal/politique-confidentialite',
    component: () => import('@/views/legal/PolitiqueConfidentialite.vue'),
  },
];

export default legalRoutes; 