import { watch, createApp, type Ref } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { i18n, LOCALE_STORAGE_KEY, syncDocumentLang, type AppLocale } from './i18n'
import router from './router'
import './styles/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

const localeRef = i18n.global.locale as Ref<AppLocale>
watch(localeRef, (v) => {
  syncDocumentLang(v)
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, v)
  } catch {
    /* ignore */
  }
})

app.mount('#app')
