import type { RouteRecordRaw } from 'vue-router'
import Profile from '@/views/settings/Profile.vue'
import TwoFactor from '@/views/settings/TwoFactor.vue'
import Settings from '@/views/settings/Settings.vue'
import ChangePassword from '@/views/settings/ChangePassword.vue'
import DeleteAccount from '@/views/settings/DeleteAccount.vue'

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
        path: 'two-factor-authentification',
        name: 'TwoFactor',
        component: TwoFactor,
        meta: { requiresAuth: true }
      },
      {
        path: 'password',
        name: 'ChangePassword',
        component: ChangePassword,
        meta: { requiresAuth: true }
      },
      {
        path: 'delete-account',
        name: 'DeleteAccount',
        component: DeleteAccount,
        meta: { requiresAuth: true }
      }
    ]
  }
]

export default routes 