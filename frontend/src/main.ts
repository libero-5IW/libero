import './assets/main.css'
import './assets/fonts.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './routes'

import 'vuetify/styles'
import vuetify from './plugins/vuetify'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css'
import '@mdi/font/css/materialdesignicons.css'

import * as Sentry from '@sentry/vue'
import { browserTracingIntegration } from '@sentry/vue'

const app = createApp(App)

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    browserTracingIntegration({
      router,
      routeLabel: 'name',
    }),
  ],
  tracePropagationTargets: ['localhost', /^https:\/\/liberogestion\.fr/],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE,
})


app.use(vuetify);

app.use(Vue3Toastify, {
  autoClose: 4000,
    position: "bottom-right",
    theme: "dark",
});

app.use(createPinia())
app.use(router)

app.mount('#app')
