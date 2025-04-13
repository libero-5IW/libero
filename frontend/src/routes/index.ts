import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import quoteTemplateRoutes from '@/routes/quoteTemplate'
import securityRoutes from '@/routes/security'

const routes: Array<RouteRecordRaw> = [
  ...quoteTemplateRoutes,
  ...securityRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
