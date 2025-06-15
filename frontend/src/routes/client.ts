import type { RouteRecordRaw } from 'vue-router'
import ClientList from '@/views/clients/ClientList.vue';
import ClientForm from '@/views/clients/ClientForm.vue';

const clientRoutes: Array<RouteRecordRaw> = [
  {
    path: '/clients',
    name: 'ClientList',
    component: ClientList,
  },
  {
    path: '/clients/new',
    name: 'ClientCreate',
    component: ClientForm,
  },
  {
    path: '/clients/:id/edit',
    name: 'ClientEdit',
    component: ClientForm,
    props: true,
  }
]

export default clientRoutes