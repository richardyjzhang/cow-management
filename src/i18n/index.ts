import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import bo from './locales/bo'

export const LOCALE_STORAGE_KEY = 'cow-mgmt-locale'

export type AppLocale = 'zh-CN' | 'bo'

function readStoredLocale(): AppLocale {
  try {
    const v = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (v === 'bo' || v === 'zh-CN') return v
  } catch {
    /* ignore */
  }
  return 'zh-CN'
}

export function syncDocumentLang(locale: AppLocale) {
  document.documentElement.lang = locale === 'bo' ? 'bo' : 'zh-CN'
  document.documentElement.dataset.locale = locale
}

const initial = readStoredLocale()
syncDocumentLang(initial)

export const i18n = createI18n({
  legacy: false,
  locale: initial,
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    bo,
  },
})
