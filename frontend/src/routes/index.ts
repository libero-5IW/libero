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
    ]
  }
]

const routes: Array<RouteRecordRaw> = [
  ...authenticatedRoutes,
  ...publicRoutes,
  ...clientRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    const requiresAuth = to.meta.requiresAuth ?? true;

    if (!authStore.isAuthenticated && !authStore.authAlreadyChecked) {
      await authStore.verifyAuth();
    }
  
    if (requiresAuth && !authStore.isAuthenticated) {
      return next({ name: 'Login' });
    }
  
    if (to.name === 'Login' && authStore.isAuthenticated) {
      return next({ name: 'Dashboard' });
    }

    next();
});

export default router
