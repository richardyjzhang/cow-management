import { useI18n } from 'vue-i18n'
import type { AppLocale } from '@/i18n'

/** 演示用 mock 字段：中文为主键值，藏文为可选 `*Bo`；按当前界面语言选取展示文案 */
export function pickMockBilingual(locale: AppLocale, zh: string, bo?: string): string {
  if (locale === 'bo' && bo?.trim()) return bo.trim()
  return zh
}

export function useMockBilingual() {
  const { locale } = useI18n()
  function pick(zh: string, bo?: string) {
    return pickMockBilingual(locale.value as AppLocale, zh, bo)
  }
  return { pick, locale }
}
