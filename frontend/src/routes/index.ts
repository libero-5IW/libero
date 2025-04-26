import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import quoteTemplateRoutes from '@/routes/quoteTemplate'
import securityRoutes from '@/routes/security'
import invoiceTemplateRoutes from '@/routes/invoiceTemplate'
import contractTemplateRoutes from './contractTemplate' 
import invoiceRoutes from './invoice';


const routes: Array<RouteRecordRaw> = [
  ...quoteTemplateRoutes,
  ...invoiceTemplateRoutes,
  ...securityRoutes,
  ...contractTemplateRoutes,
  ...invoiceRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
