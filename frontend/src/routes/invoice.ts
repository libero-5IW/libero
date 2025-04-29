import type { RouteRecordRaw } from 'vue-router';
import InvoiceForm from '../views/invoice/InvoiceForm.vue'
import InvoiceList from '../views/invoice/InvoiceList.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/invoice',
        children: [
          { path: '', name: 'InvoiceList', component: InvoiceList },
          { path: 'new', name: 'InvoiceForm', component: InvoiceForm },
        ],
      }
      
];

export default routes;
