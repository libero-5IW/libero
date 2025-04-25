import type { RouteRecordRaw } from 'vue-router'
import InvoiceTemplateForm from '@/views/invoiceTemplate/InvoiceTemplateForm.vue'
import InvoiceTemplateList from '@/views/invoiceTemplate/InvoiceTemplateList.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/invoice-template',
    children: [
      { path: '', name: 'InvoiceTemplateList', component: InvoiceTemplateList },
      { path: 'new', name: 'InvoiceTemplateForm', component: InvoiceTemplateForm },
      { path: 'edit/:id', name: 'InvoiceTemplateEdit', component: InvoiceTemplateForm },
    ],
    // meta: { requiresAuth: true },
  },
]

export default routes
