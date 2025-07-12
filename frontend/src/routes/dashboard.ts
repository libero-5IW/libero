import type { RouteRecordRaw } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/dashboard',
        redirect: {name: 'Dashboard'},
        children: [
            { path: '', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
        ],
    }
];

export default routes;
