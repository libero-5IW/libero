import type { RouteRecordRaw } from 'vue-router'
import InvoiceTemplateForm from '@/views/invoiceTemplate/InvoiceTemplateForm.vue'
import InvoiceTemplateList from '@/views/invoiceTemplate/InvoiceTemplateList.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/invoice-template',
    children: [
      { path: '', name: 'InvoiceTemplateList', component: InvoiceTemplateList, meta: { requiresAuth: true } },
      { path: 'new', name: 'InvoiceTemplateForm', component: InvoiceTemplateForm, meta: { requiresAuth: true } },
      { path: 'edit/:id', name: 'InvoiceTemplateEdit', component: InvoiceTemplateForm, meta: { requiresAuth: true } },
    ],
    // meta: { requiresAuth: true },
  },
]

export default routes
