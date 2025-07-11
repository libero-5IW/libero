import type { RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        children: [
            { path: '', name: 'Home', component: HomeView },
            { path: 'login', name: 'Login', component: HomeView },
        ],
    }
];

export default routes;
