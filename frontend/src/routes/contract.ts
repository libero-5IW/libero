import type { RouteRecordRaw } from 'vue-router'
import ContractForm from '@/views/contract/ContractForm.vue'
import ContractList from '@/views/contract/ContractList.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/contract',
    children: [
      { path: '', name: 'ContractList', component: ContractList, meta: { requiresAuth: true } },
      { path: 'new', name: 'ContractForm', component: ContractForm, meta: { requiresAuth: true } },
      { path: ':id/edit', name: 'ContractEdit', component: ContractForm, props: true, meta: { requiresAuth: true } },
    ]
  }
]

export default routes
