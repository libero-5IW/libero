import type { RouteRecordRaw } from 'vue-router'
import Profile from '@/views/Profile.vue'

const profileRoutes: Array<RouteRecordRaw> = [
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      requiresAuth: true
    }
  }
]

export default profileRoutes 