import type { RouteRecordRaw } from 'vue-router';
import Login from '@/views/public/Login.vue';
import Register from '@/views/public/Register.vue';
import NotFound from '@/views/public/NotFound.vue';
import RequestPasswordReset from '@/views/public/RequestPasswordReset.vue';
import ResetPassword from '@/views/public/ResetPassword.vue';
import Landing from '@/views/public/Landing.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    children: [
      {
        path: 'home',
        name: 'Landing',
        component: Landing,
        meta: { requiresAuth: false, publicOnly: false }
      },
      {
        path: 'login',
        name: 'Login',
        component: Login,
        meta: { requiresAuth: false, publicOnly: true }
      },
      {
        path: 'register',
        name: 'Register',
        component: Register,
        meta: { requiresAuth: false, publicOnly: true }
      },
      {
        path: 'email-reset-password',
        name: 'EmailResetPassword',
        component: RequestPasswordReset,
        meta: { requiresAuth: false, publicOnly: true }
      },
      {
        path: 'new-password',
        name: 'NewPassword',
        component: ResetPassword,
        meta: { requiresAuth: false, publicOnly: true }
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound,
        meta: { requiresAuth: false }
      }
    ],
  }
];

export default routes;
