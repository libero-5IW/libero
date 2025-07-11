import type { RouteRecordRaw } from 'vue-router'
import Profile from '@/views/Profile.vue'
import Settings from '@/views/Settings.vue'

const profileRoutes: Array<RouteRecordRaw> = [
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      requiresAuth: true
    }
  }
]

export default profileRoutes 