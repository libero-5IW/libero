import type { RouteRecordRaw } from 'vue-router';
import Login from '@/views/public/Login.vue';
import Register from '@/views/public/Register.vue';
import NotFound from '@/views/public/NotFound.vue';
import RequestPasswordReset from '@/views/public/RequestPasswordReset.vue';
import ResetPassword from '@/views/public/ResetPassword.vue';
import Landing from '@/views/public/Landing.vue';
import PrivacyPolicy from '@/views/legal/PolitiqueConfidentialite.vue';
import PublicContainer from '@/components/Container/PublicContainer.vue';
import Help from '@/views/public/Help.vue'
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: PublicContainer,
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
        path: 'help',
        name: 'Help',
        component: Help,
        meta: { requiresAuth: false, publicOnly: false }
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
      },
      {
        path: '/privacy-policy',
        component: PrivacyPolicy,
        meta: { requiresAuth: false }
      },
    ],
  }
];

export default routes;
