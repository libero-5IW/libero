import type { RouteRecordRaw } from 'vue-router';
import ContractTemplateForm from '@/views/contractTemplate/ContractTemplateForm.vue';
import ContractTemplateList from '@/views/contractTemplate/ContractTemplateList.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/contract-template',
    children: [
      { path: '', name: 'ContractTemplateList', component: ContractTemplateList },
      { path: 'new', name: 'ContractTemplateForm', component: ContractTemplateForm },
      { path: 'edit/:id', name: 'ContractTemplateEdit', component: ContractTemplateForm },
    ],
  }
];

export default routes;
