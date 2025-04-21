import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import quoteTemplateRoutes from '@/routes/quoteTemplate'
import securityRoutes from '@/routes/security'
import invoiceTemplateRoutes from '@/routes/invoiceTemplate'

const routes: Array<RouteRecordRaw> = [
  ...quoteTemplateRoutes,
  ...invoiceTemplateRoutes,
  ...securityRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
