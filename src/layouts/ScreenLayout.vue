<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const clock = ref('')

const screenTabs = computed(() => [
  { path: '/screen/overview', label: t('screenChrome.tabOverview') },
  { path: '/screen/breeding', label: t('screenChrome.tabBreeding') },
  { path: '/screen/fund', label: t('screenChrome.tabFund') },
])

const activePath = computed(() => route.path)

let timer: ReturnType<typeof setInterval> | undefined

function updateClock() {
  const loc = locale.value === 'bo' ? 'bo-CN' : 'zh-CN'
  clock.value = new Date().toLocaleString(loc, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function goBack() {
  void router.push('/dashboard')
}

onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="screen-root">
    <header class="screen-root__header">
      <div class="screen-root__brand">
        <div class="screen-root__title-row">
          <span class="screen-root__title">{{ t('screenChrome.title') }}</span>
          <span class="screen-root__tag">{{ t('screenChrome.tag') }}</span>
        </div>
        <p class="screen-root__subtitle">{{ t('screenChrome.subtitle') }}</p>
      </div>

      <nav class="screen-root__tabs" aria-label="子屏切换">
        <RouterLink
          v-for="tab in screenTabs"
          :key="tab.path"
          :to="tab.path"
          class="screen-root__tab"
          :class="{ 'screen-root__tab--active': activePath === tab.path }"
        >
          {{ tab.label }}
        </RouterLink>
      </nav>

      <div class="screen-root__actions">
        <div class="screen-root__clock">{{ clock }}</div>
        <button type="button" class="screen-root__back" @click="goBack">{{ t('screenChrome.backToApp') }}</button>
      </div>
    </header>
    <main class="screen-root__main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.screen-root {
  --screen-bg0: #050b14;
  --screen-bg1: #0a1628;
  --screen-line: rgba(56, 189, 248, 0.35);
  --screen-glow: rgba(34, 211, 238, 0.45);
  --screen-gold: #e8d4a8;
  --screen-text: #e8f4ff;

  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: var(--screen-text);
  background:
    radial-gradient(ellipse 120% 80% at 50% -20%, rgba(34, 211, 238, 0.12), transparent 55%),
    linear-gradient(180deg, var(--screen-bg0) 0%, var(--screen-bg1) 40%, #04080f 100%);
  background-attachment: fixed;
}

.screen-root::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(var(--screen-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--screen-line) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 0.35;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 75%);
  animation: screenGridPulse 7s ease-in-out infinite;
}

@keyframes screenGridPulse {
  0%,
  100% {
    opacity: 0.28;
  }
  50% {
    opacity: 0.48;
  }
}

.screen-root__header {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 0.75rem 1rem;
  padding: 0.5rem 1rem 0.55rem;
  border-bottom: 1px solid rgba(34, 211, 238, 0.25);
  box-shadow: 0 0 24px rgba(34, 211, 238, 0.08);
  background: linear-gradient(90deg, rgba(6, 20, 40, 0.92), rgba(10, 28, 52, 0.75));
}

@media (max-width: 72rem) {
  .screen-root__header {
    grid-template-columns: 1fr;
    justify-items: stretch;
  }

  .screen-root__tabs {
    order: 3;
    justify-content: center;
  }

  .screen-root__actions {
    order: 2;
    justify-content: space-between;
    width: 100%;
  }
}

.screen-root__brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  min-width: 0;
}

.screen-root__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
  min-width: 0;
}

.screen-root__title {
  position: relative;
  font-size: clamp(0.95rem, 1.6vw, 1.25rem);
  font-weight: 700;
  letter-spacing: 0.06em;
  white-space: nowrap;
  text-shadow: 0 0 18px var(--screen-glow);
  overflow: hidden;
}

.screen-root__title::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.09),
    transparent
  );
  transform: translateX(-120%);
  animation: screenTitleShine 5.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes screenTitleShine {
  0%,
  40% {
    transform: translateX(-120%);
  }
  60%,
  100% {
    transform: translateX(120%);
  }
}

.screen-root__tag {
  font-size: 0.6875rem;
  padding: 0.1rem 0.45rem;
  border: 1px solid rgba(232, 212, 168, 0.45);
  border-radius: 999px;
  color: var(--screen-gold);
  letter-spacing: 0.08em;
  opacity: 0.95;
  flex-shrink: 0;
}

.screen-root__subtitle {
  margin: 0;
  font-size: 0.6875rem;
  color: rgba(226, 232, 240, 0.58);
  letter-spacing: 0.04em;
  line-height: 1.35;
  max-width: 36rem;
}

.screen-root__tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.screen-root__tab {
  padding: 0.35rem 0.85rem;
  border-radius: 0.375rem;
  border: 1px solid rgba(34, 211, 238, 0.28);
  background: rgba(6, 28, 48, 0.55);
  color: rgba(165, 243, 252, 0.85);
  font-size: 0.8125rem;
  letter-spacing: 0.06em;
  text-decoration: none;
  transition:
    background 0.2s,
    border-color 0.2s,
    box-shadow 0.2s,
    color 0.2s;
  white-space: nowrap;
}

.screen-root__tab:hover {
  border-color: rgba(56, 189, 248, 0.55);
  color: #ecfeff;
}

.screen-root__tab--active {
  border-color: rgba(34, 211, 238, 0.75);
  background: rgba(34, 211, 238, 0.12);
  color: #fef9c3;
  box-shadow:
    0 0 16px rgba(34, 211, 238, 0.25),
    inset 0 0 12px rgba(34, 211, 238, 0.08);
  text-shadow: 0 0 12px rgba(34, 211, 238, 0.45);
}

.screen-root__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  min-width: 0;
}

.screen-root__clock {
  font-variant-numeric: tabular-nums;
  font-size: 0.875rem;
  color: rgba(232, 244, 255, 0.85);
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.screen-root__back {
  cursor: pointer;
  flex-shrink: 0;
  border: 1px solid rgba(34, 211, 238, 0.5);
  background: rgba(6, 40, 60, 0.5);
  color: #a5f3fc;
  font-size: 0.8125rem;
  padding: 0.35rem 0.75rem;
  border-radius: 0.375rem;
  transition:
    background 0.2s,
    border-color 0.2s,
    color 0.2s;
}

.screen-root__back:hover {
  background: rgba(34, 211, 238, 0.15);
  border-color: rgba(165, 243, 252, 0.85);
  color: #ecfeff;
}

.screen-root__main {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  padding: 0.5rem 0.75rem 0.6rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
