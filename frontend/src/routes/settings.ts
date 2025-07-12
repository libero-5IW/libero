import type { RouteRecordRaw } from 'vue-router'
import Profile from '@/views/settings/Profile.vue'
import Security from '@/views/settings/Security.vue'
import Settings from '@/views/settings/Settings.vue'
import ChangePassword from '@/views/settings/ChangePassword.vue'

const routes: Array<RouteRecordRaw> = [
    {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/settings/profile'
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: { requiresAuth: true }
      },
      {
        path: 'security',
        name: 'Security',
        component: Security,
        meta: { requiresAuth: true }
      },
      {
        path: 'password',
        name: 'ChangePassword',
        component: ChangePassword,
        meta: { requiresAuth: true }
      }
    ]
  }
]

export default routes 