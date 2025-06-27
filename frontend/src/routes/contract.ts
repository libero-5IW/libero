import type { RouteRecordRaw } from 'vue-router'
import ContractForm from '@/views/contract/ContractForm.vue'
import ContractList from '@/views/contract/ContractList.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/contract',
    children: [
      { path: '', name: 'ContractList', component: ContractList },
      { path: 'new', name: 'ContractForm', component: ContractForm },
      { path: ':id/edit', name: 'ContractEdit', component: ContractForm, props: true },
    ]
  }
]

export default routes
