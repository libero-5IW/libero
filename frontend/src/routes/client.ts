import type { RouteRecordRaw } from 'vue-router'
import ClientForm from '@/views/clients/ClientForm.vue'
import ClientList from '@/views/clients/ClientList.vue'


const clientRoutes: Array<RouteRecordRaw> = [
  {
    path: '/clients',
    children: [
      { path: '', name: 'ClientList', component: ClientList },
      { path: 'new', name: 'ClientCreate', component: ClientForm },
      { path: ':id/edit', name: 'ClientEdit', component: ClientForm, props: true },
    ]
  }
]

export default clientRoutes
