<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { AppLocale } from '@/i18n'

withDefaults(defineProps<{ variant?: 'light' | 'dark' }>(), { variant: 'light' })

const { t, locale } = useI18n()

function setLocale(code: AppLocale) {
  locale.value = code
}
</script>

<template>
  <div
    class="lang-switch flex shrink-0 items-center gap-0.5 rounded-md p-0.5"
    :class="
      variant === 'dark'
        ? 'border border-white/20 bg-black/25 backdrop-blur-sm'
        : 'border border-[#e5e6eb] bg-[#f7f8fa]'
    "
    role="group"
    :aria-label="t('lang.switchGroup')"
  >
    <button
      type="button"
      class="lang-switch__btn rounded px-2.5 py-1 text-xs transition-colors"
      :class="
        variant === 'dark'
          ? locale === 'zh-CN'
            ? 'bg-white/15 font-medium text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
          : locale === 'zh-CN'
            ? 'bg-white font-medium text-[#1d2129] shadow-sm'
            : 'text-[#86909c] hover:bg-white/80 hover:text-[#4e5969]'
      "
      @click="setLocale('zh-CN')"
    >
      {{ t('lang.zh') }}
    </button>
    <button
      type="button"
      class="lang-switch__btn rounded px-2.5 py-1 text-xs transition-colors"
      :class="
        variant === 'dark'
          ? locale === 'bo'
            ? 'bg-white/15 font-medium text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
          : locale === 'bo'
            ? 'bg-white font-medium text-[#1d2129] shadow-sm'
            : 'text-[#86909c] hover:bg-white/80 hover:text-[#4e5969]'
      "
      @click="setLocale('bo')"
    >
      {{ t('lang.bo') }}
    </button>
  </div>
</template>

<style scoped>
.lang-switch__btn {
  font-family: inherit;
}

:root[data-locale='bo'] .lang-switch__btn {
  font-family:
    'Microsoft YaHei',
    'PingFang SC',
    'Microsoft Himalaya',
    'Noto Sans Tibetan',
    sans-serif;
}
</style>
