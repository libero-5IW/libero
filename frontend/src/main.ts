import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './routes'

import 'vuetify/styles'
import vuetify from './plugins/vuetify'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css'
import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App)

app.use(vuetify);

app.use(Vue3Toastify, {
    autoClose: 4000, 
    position: "bottom-right",
    theme: "dark",
});

app.use(createPinia())
app.use(router)

app.mount('#app')
