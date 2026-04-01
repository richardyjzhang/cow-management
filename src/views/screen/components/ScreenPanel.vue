<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    hint?: string
    /**
     * side：左右栏 — 四角 L + 顶扫描线（青）
     * center：中间栏 — 顶双轨光带 + 侧肋 + 紫青点缀
     */
    variant?: 'side' | 'center'
  }>(),
  { variant: 'side' },
)
</script>

<template>
  <section class="screen-panel" :class="`screen-panel--${variant}`">
    <span
      v-for="p in ['tl', 'tr', 'bl', 'br'] as const"
      :key="p"
      class="screen-panel__corner"
      :class="[`screen-panel__corner--${p}`, `screen-panel__corner--${variant}`]"
      aria-hidden="true"
    />
    <template v-if="variant === 'center'">
      <span class="screen-panel__rail screen-panel__rail--left" aria-hidden="true" />
      <span class="screen-panel__rail screen-panel__rail--right" aria-hidden="true" />
    </template>

    <header class="screen-panel__head" :class="`screen-panel__head--${variant}`">
      <div class="screen-panel__title-wrap">
        <span class="screen-panel__accent" :class="`screen-panel__accent--${variant}`" aria-hidden="true" />
        <span class="screen-panel__title">{{ title }}</span>
      </div>
      <span v-if="hint" class="screen-panel__hint">{{ hint }}</span>
    </header>
    <div class="screen-panel__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
/* ========== 基础 ========== */
.screen-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: 0.375rem;
  padding: 0.5rem 0.6rem 0.55rem;
  overflow: hidden;
}

.screen-panel__head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
  padding-bottom: 0.35rem;
}

.screen-panel__title-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
}

.screen-panel__title {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #e0f2fe;
}

.screen-panel__hint {
  font-size: 0.625rem;
  color: rgba(226, 232, 240, 0.42);
}

.screen-panel__body {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* ========== 左右栏 variant：side ========== */
.screen-panel--side {
  background: linear-gradient(145deg, rgba(8, 28, 52, 0.72), rgba(4, 14, 28, 0.55));
  border: 1px solid rgba(34, 211, 238, 0.22);
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.45) inset,
    0 12px 36px rgba(0, 0, 0, 0.35);
  animation: screenPanelGlowSide 5.5s ease-in-out infinite;
}

@keyframes screenPanelGlowSide {
  0%,
  100% {
    border-color: rgba(34, 211, 238, 0.22);
    box-shadow:
      0 0 0 1px rgba(15, 23, 42, 0.45) inset,
      0 12px 36px rgba(0, 0, 0, 0.35),
      0 0 0 rgba(34, 211, 238, 0);
  }
  50% {
    border-color: rgba(56, 189, 248, 0.38);
    box-shadow:
      0 0 0 1px rgba(15, 23, 42, 0.45) inset,
      0 12px 36px rgba(0, 0, 0, 0.35),
      0 0 18px rgba(34, 211, 238, 0.15);
  }
}

.screen-panel--side::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(34, 211, 238, 0.2),
    rgba(56, 189, 248, 0.75),
    rgba(167, 139, 250, 0.45),
    rgba(34, 211, 238, 0.2),
    transparent
  );
  background-size: 200% 100%;
  animation: screenPanelScanSide 4s linear infinite;
  pointer-events: none;
}

@keyframes screenPanelScanSide {
  0% {
    background-position: 0% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.screen-panel__corner--side {
  width: 12px;
  height: 12px;
  border-color: rgba(34, 211, 238, 0.75);
  filter: drop-shadow(0 0 4px rgba(34, 211, 238, 0.45));
}

.screen-panel__head--side {
  border-bottom: 1px solid rgba(34, 211, 238, 0.18);
}

.screen-panel__accent--side {
  width: 3px;
  height: 0.95rem;
  border-radius: 2px;
  background: linear-gradient(180deg, #22d3ee, rgba(34, 211, 238, 0.25));
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.55);
}

.screen-panel--side .screen-panel__title {
  animation: screenPanelTitleGlowCyan 3.2s ease-in-out infinite;
}

@keyframes screenPanelTitleGlowCyan {
  0%,
  100% {
    text-shadow: 0 0 8px rgba(34, 211, 238, 0.25);
  }
  50% {
    text-shadow: 0 0 16px rgba(34, 211, 238, 0.55);
  }
}

/* ========== 中间栏 variant：center ========== */
.screen-panel--center {
  background: linear-gradient(160deg, rgba(18, 12, 40, 0.55), rgba(6, 18, 42, 0.72));
  border: 1px solid rgba(167, 139, 250, 0.28);
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.5) inset,
    0 0 28px rgba(167, 139, 250, 0.12),
    0 16px 40px rgba(0, 0, 0, 0.4);
  animation: screenPanelGlowHub 6s ease-in-out infinite;
}

@keyframes screenPanelGlowHub {
  0%,
  100% {
    border-color: rgba(167, 139, 250, 0.26);
    box-shadow:
      0 0 0 1px rgba(15, 23, 42, 0.5) inset,
      0 0 20px rgba(167, 139, 250, 0.08),
      0 16px 40px rgba(0, 0, 0, 0.4);
  }
  50% {
    border-color: rgba(250, 204, 21, 0.22);
    box-shadow:
      0 0 0 1px rgba(15, 23, 42, 0.5) inset,
      0 0 32px rgba(250, 204, 21, 0.1),
      0 16px 40px rgba(0, 0, 0, 0.4);
  }
}

/* 顶双轨光带 */
.screen-panel--center::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 4px;
  background: linear-gradient(
    90deg,
    rgba(250, 204, 21, 0.15),
    rgba(34, 211, 238, 0.55),
    rgba(167, 139, 250, 0.5),
    rgba(34, 211, 238, 0.45),
    rgba(250, 204, 21, 0.12)
  );
  background-size: 220% 100%;
  animation: screenPanelScanHub 5.5s ease-in-out infinite;
  pointer-events: none;
  box-shadow: 0 1px 0 rgba(34, 211, 238, 0.35);
}

.screen-panel__rail {
  position: absolute;
  top: 8px;
  bottom: 8px;
  width: 2px;
  border-radius: 2px;
  pointer-events: none;
  z-index: 0;
  opacity: 0.9;
}

.screen-panel__rail--left {
  left: 6px;
  background: linear-gradient(
    180deg,
    rgba(250, 204, 21, 0.45),
    transparent 38%,
    transparent 62%,
    rgba(34, 211, 238, 0.38)
  );
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.15);
}

.screen-panel__rail--right {
  right: 6px;
  background: linear-gradient(
    180deg,
    rgba(167, 139, 250, 0.4),
    transparent 40%,
    transparent 60%,
    rgba(250, 204, 21, 0.2)
  );
  box-shadow: 0 0 10px rgba(167, 139, 250, 0.12);
}

.screen-panel--center .screen-panel__body,
.screen-panel--center .screen-panel__head {
  position: relative;
  z-index: 1;
}

.screen-panel__corner--center {
  width: 11px;
  height: 11px;
  border-color: rgba(250, 204, 21, 0.55);
  filter: drop-shadow(0 0 5px rgba(250, 204, 21, 0.35));
}

.screen-panel__head--center {
  border-bottom: 1px solid rgba(51, 65, 85, 0.4);
  box-shadow: 0 1px 0 rgba(34, 211, 238, 0.2);
}

.screen-panel__accent--center {
  width: 4px;
  height: 1rem;
  border-radius: 1px;
  background: linear-gradient(180deg, #fde68a, #22d3ee 55%, #a78bfa);
  box-shadow:
    0 0 12px rgba(250, 204, 21, 0.35),
    0 0 8px rgba(34, 211, 238, 0.4);
}

.screen-panel--center .screen-panel__title {
  animation: screenPanelTitleGlowHub 3.5s ease-in-out infinite;
}

@keyframes screenPanelTitleGlowHub {
  0%,
  100% {
    text-shadow:
      0 0 8px rgba(250, 204, 21, 0.2),
      0 0 10px rgba(167, 139, 250, 0.25);
  }
  50% {
    text-shadow:
      0 0 14px rgba(34, 211, 238, 0.45),
      0 0 12px rgba(250, 204, 21, 0.25);
  }
}

@keyframes screenPanelScanHub {
  0%,
  100% {
    background-position: 0% 0;
    opacity: 1;
  }
  50% {
    background-position: 100% 0;
    opacity: 0.92;
  }
}

/* L 型角标定位（两 variant 共用结构） */
.screen-panel__corner {
  position: absolute;
  pointer-events: none;
  z-index: 2;
  box-sizing: border-box;
}

.screen-panel__corner--tl {
  top: 0;
  left: 0;
  border-top: 2px solid;
  border-left: 2px solid;
  border-top-left-radius: 2px;
}

.screen-panel__corner--tr {
  top: 0;
  right: 0;
  border-top: 2px solid;
  border-right: 2px solid;
  border-top-right-radius: 2px;
}

.screen-panel__corner--bl {
  bottom: 0;
  left: 0;
  border-bottom: 2px solid;
  border-left: 2px solid;
  border-bottom-left-radius: 2px;
}

.screen-panel__corner--br {
  bottom: 0;
  right: 0;
  border-bottom: 2px solid;
  border-right: 2px solid;
  border-bottom-right-radius: 2px;
}
</style>
