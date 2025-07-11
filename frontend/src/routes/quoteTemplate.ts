import type { RouteRecordRaw } from 'vue-router';
import QuoteTemplateForm from '@/views/quoteTemplate/QuoteTemplateForm.vue';
import QuoteTemplateList from '@/views/quoteTemplate/QuoteTemplateList.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/quote-template',
        children: [
            { path: '', name: 'QuoteTemplateList', component: QuoteTemplateList, meta: { requiresAuth: true } },
            { path: 'new', name: 'QuoteTemplateForm', component: QuoteTemplateForm, meta: { requiresAuth: true } },
            { path: 'edit/:id', name: 'QuoteTemplateEdit', component: QuoteTemplateForm, meta: { requiresAuth: true } },
        ],
    }
];

export default routes;
