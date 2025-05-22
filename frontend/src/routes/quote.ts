import type { RouteRecordRaw } from 'vue-router';
import QuoteForm from '@/views/quote/QuoteForm.vue';
import QuoteList from '@/views/quote/QuoteList.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/quote',
        children: [
          { path: '', name: 'QuoteList', component: QuoteList },
          { path: 'new', name: 'QuoteForm', component: QuoteForm },
        ],
      }
      
];

export default routes;
