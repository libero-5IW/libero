import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import quoteTemplateRoutes from '@/routes/quoteTemplate'
import securityRoutes from '@/routes/security'
import contractTemplateRoutes from './contractTemplate' 


const routes: Array<RouteRecordRaw> = [
  ...quoteTemplateRoutes,
  ...securityRoutes,
  ...contractTemplateRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
