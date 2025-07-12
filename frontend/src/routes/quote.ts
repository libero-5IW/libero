import type { RouteRecordRaw } from 'vue-router';
import QuoteForm from '@/views/quote/QuoteForm.vue';
import QuoteList from '@/views/quote/QuoteList.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/quote',
        children: [
          { path: '', name: 'QuoteList', component: QuoteList, meta: { requiresAuth: true } },
          { path: 'new', name: 'QuoteForm', component: QuoteForm, meta: { requiresAuth: true } },
          { path: ':id/edit', name: 'QuoteEdit', component: QuoteForm, props: true, meta: { requiresAuth: true } },
        ],
      }
      
];

export default routes;

