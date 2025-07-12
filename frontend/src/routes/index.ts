import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import quoteTemplateRoutes from '@/routes/quoteTemplate'
import quoteRoutes from '@/routes//quote'
import invoiceTemplateRoutes from '@/routes/invoiceTemplate'
import contractTemplateRoutes from './contractTemplate' 
import invoiceRoutes from './invoice';
import publicRoutes from '@/routes/public'
import dashboardRoute from '@/routes/dashboard'
import clientRoutes from '@/routes/client'
import profileRoutes from '@/routes/profile'
import { useAuthStore } from '@/stores/auth';
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import contractRoutes from '@/routes/contract'
import legalRoutes from './legal';
import apiRoutes from './api'

const authenticatedRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      ...quoteTemplateRoutes,
      ...quoteRoutes,
      ...invoiceTemplateRoutes,
      ...contractTemplateRoutes,
      ...invoiceRoutes,
      ...dashboardRoute,
      ...clientRoutes,
      ...profileRoutes,
      ...contractRoutes,
      ...legalRoutes,
      ...apiRoutes,
    ]
  },
  
]

const routes: Array<RouteRecordRaw> = [
  ...authenticatedRoutes,
  ...publicRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
      await authStore.isUserAuthenticated();
    }
    
    const requiresAuth = to.meta.requiresAuth ?? true;
    const publicOnly = to.meta.publicOnly ?? false;

    if (requiresAuth && !authStore.isAuthenticated && !authStore.authAlreadyChecked) {
      await authStore.verifyAuth();
    }

    if (to.path === '/' && !authStore.isAuthenticated) {
      return next({ path: '/home' });
    }

    if (requiresAuth && !authStore.isAuthenticated) {
      return next({ name: 'Login' });
    }
    
    if (authStore.isAuthenticated && (publicOnly || to.path === '/')) {
      return next({ name: 'Dashboard' });
    }

    next();
});

export default router
