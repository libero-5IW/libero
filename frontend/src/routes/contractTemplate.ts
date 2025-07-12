import type { RouteRecordRaw } from 'vue-router';
import ContractTemplateForm from '@/views/contractTemplate/ContractTemplateForm.vue';
import ContractTemplateList from '@/views/contractTemplate/ContractTemplateList.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/contract-template',
    children: [
      { path: '', name: 'ContractTemplateList', component: ContractTemplateList, meta: { requiresAuth: true } },
      { path: 'new', name: 'ContractTemplateForm', component: ContractTemplateForm, meta: { requiresAuth: true } },
      { path: 'edit/:id', name: 'ContractTemplateEdit', component: ContractTemplateForm, meta: { requiresAuth: true } },
    ],
  }
];

export default routes;
