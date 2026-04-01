<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const clock = ref('')

let timer: ReturnType<typeof setInterval> | undefined

function updateClock() {
  clock.value = new Date().toLocaleString('zh-CN', {
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
        <span class="screen-root__title">优质奶牛管理信息系统</span>
        <span class="screen-root__tag">数据可视化大屏</span>
      </div>
      <div class="screen-root__clock">{{ clock }}</div>
      <button type="button" class="screen-root__back" @click="goBack">返回管理端</button>
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

  min-height: 100vh;
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
}

.screen-root__header {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid rgba(34, 211, 238, 0.25);
  box-shadow: 0 0 24px rgba(34, 211, 238, 0.08);
  background: linear-gradient(90deg, rgba(6, 20, 40, 0.92), rgba(10, 28, 52, 0.75));
}

.screen-root__brand {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  min-width: 0;
}

.screen-root__title {
  font-size: clamp(1rem, 2vw, 1.35rem);
  font-weight: 700;
  letter-spacing: 0.06em;
  white-space: nowrap;
  text-shadow: 0 0 18px var(--screen-glow);
}

.screen-root__tag {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border: 1px solid rgba(232, 212, 168, 0.45);
  border-radius: 999px;
  color: var(--screen-gold);
  letter-spacing: 0.08em;
  opacity: 0.95;
}

.screen-root__clock {
  font-variant-numeric: tabular-nums;
  font-size: 0.95rem;
  color: rgba(232, 244, 255, 0.85);
  letter-spacing: 0.04em;
}

.screen-root__back {
  cursor: pointer;
  border: 1px solid rgba(34, 211, 238, 0.5);
  background: rgba(6, 40, 60, 0.5);
  color: #a5f3fc;
  font-size: 0.875rem;
  padding: 0.4rem 0.9rem;
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
  padding: 1rem 1.25rem 1.25rem;
  overflow: auto;
}
</style>
