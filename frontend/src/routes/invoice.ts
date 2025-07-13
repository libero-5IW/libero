import type { RouteRecordRaw } from 'vue-router';
import InvoiceForm from '../views/invoice/InvoiceForm.vue'
import InvoiceList from '../views/invoice/InvoiceList.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/invoice',
        children: [
          { path: '', name: 'InvoiceList', component: InvoiceList, meta: { requiresAuth: true } },
          { path: 'new', name: 'InvoiceForm', component: InvoiceForm, meta: { requiresAuth: true } },
          { path: ':id/edit', name: 'InvoiceEdit', component: InvoiceForm, props: true, meta: { requiresAuth: true } },
        ],
      }
      
];

export default routes;
