import type { RouteRecordRaw } from 'vue-router';
import ClientTemplateForm from '@/views/clientTemplate/ClientTemplateForm.vue';
import ClientTemplateList from '@/views/clientTemplate/ClientTemplateList.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/client-template',
    children: [
      { path: '', name: 'ClientTemplateList', component: ClientTemplateList },
      { path: 'new', name: 'ClientTemplateForm', component: ClientTemplateForm },
      { path: 'edit/:id', name: 'ClientTemplateEdit', component: ClientTemplateForm },
    ]
  }
];

export default routes;