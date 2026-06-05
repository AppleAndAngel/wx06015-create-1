import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { Lazyload } from 'vant'
import 'vant/lib/index.css'
import './assets/styles/global.scss'
import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(Lazyload, {
  lazyComponent: true,
})

app.mount('#app')
