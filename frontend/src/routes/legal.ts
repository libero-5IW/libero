import type { RouteRecordRaw } from 'vue-router';

const legalRoutes: RouteRecordRaw[] = [
  {
    path: '/legal',
    component: () => import('@/views/Legal.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/legal/cgu',
    component: () => import('@/views/legal/CGU.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/legal/mentions-legales',
    component: () => import('@/views/legal/MentionsLegales.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/legal/politique-confidentialite',
    component: () => import('@/views/legal/PolitiqueConfidentialite.vue'),
    meta: { requiresAuth: true }
  },
];

export default legalRoutes; 