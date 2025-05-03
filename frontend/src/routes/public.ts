import type { RouteRecordRaw } from 'vue-router';
import Login from '@/views/public/Login.vue';
import Register from '@/views/public/Register.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    children: [
      {
        path: 'login',
        name: 'Login',
        component: Login,
        meta: { requiresAuth: false }
      },
      {
        path: 'register',
        name: 'Register',
        component: Register,
        meta: { requiresAuth: false }
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/public/NotFound.vue'),
        meta: { requiresAuth: false }
      }
    ],
  }
];

export default routes;
